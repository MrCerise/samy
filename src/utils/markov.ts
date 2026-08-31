import type Client from "@/classes/client";

const START = "__START__";
const END = "__END__";

const START_KEY = `${START} ${START}`;

const URL_REGEX = /(?:https?:\/\/|\bwww\.)\S+/gi;
const MENTION_REGEX = /<@!?&?\d+>|@everyone|@here/gi;
const PUNCT_ONLY_REGEX = /^[\p{P}\p{S}\s]+$/u;

type ChainMap = Record<string, Record<string, number>>;

/**
 * True if the guild has Markov learning enabled, caching the result on the
 * client (mirrors the getGuildPrefix cache pattern in utils/settings.ts).
 */
export async function isMarkovEnabled(
  guildId: string,
  client: Client,
): Promise<boolean> {
  const cached = client.markovEnabled.get(guildId);
  if (cached !== undefined) return cached;

  const guild = await client.prisma.guild.findUnique({
    where: { id: guildId },
    select: { markovEnabled: true },
  });

  const value = guild?.markovEnabled ?? false;

  client.markovEnabled.set(guildId, value);

  return value;
}

/**
 * Enable/disable Markov learning for a guild. Persists via upsert (same as
 * prefix.ts) and keeps the in-memory cache in sync.
 */
export async function setMarkovEnabled(
  guildId: string,
  enabled: boolean,
  client: Client,
): Promise<void> {
  await client.prisma.guild.upsert({
    where: { id: guildId },
    create: { id: guildId, markovEnabled: enabled },
    update: { markovEnabled: enabled },
  });

  client.markovEnabled.set(guildId, enabled);
}

function parseChain(data: string): ChainMap {
  try {
    return JSON.parse(data) as ChainMap;
  } catch {
    return {};
  }
}

/**
 * Read a guild's chain, populating the in-memory cache on first access.
 * Returns null when nothing has been learned yet.
 */
export async function getChain(
  client: Client,
  guildId: string,
): Promise<ChainMap | null> {
  const cached = client.markovChains.get(guildId);
  if (cached !== undefined) {
    return cached.length === 0 ? null : parseChain(cached);
  }

  const row = await client.prisma.markovChain.findUnique({
    where: { guildId },
    select: { data: true },
  });

  const data = row?.data ?? "";

  client.markovChains.set(guildId, data);

  return data.length === 0 ? null : parseChain(data);
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(URL_REGEX, " ")
    .replace(MENTION_REGEX, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0 && !PUNCT_ONLY_REGEX.test(token));
}

function recordTransition(chain: ChainMap, key: string, next: string) {
  const transitions = (chain[key] ??= {});
  transitions[next] = (transitions[next] ?? 0) + 1;
}

/**
 * Feed a message's content into the guild's in-memory chain and mark it
 * dirty so it is persisted on the next flush.
 */
export async function learnMarkov(
  client: Client,
  guildId: string,
  content: string,
): Promise<void> {
  const tokens = tokenize(content);

  if (tokens.length === 0) return;

  const chain = (await getChain(client, guildId)) ?? {};

  const sequence = [START, START, ...tokens, END];

  for (let i = 0; i < sequence.length - 2; i++) {
    recordTransition(
      chain,
      `${sequence[i]} ${sequence[i + 1]}`,
      sequence[i + 2]!,
    );
  }

  client.markovChains.set(guildId, JSON.stringify(chain));
  client.markovDirty.add(guildId);
}

/**
 * Persist every dirty guild's chain to Postgres in a single upsert each.
 */
export async function flushDirtyChains(client: Client): Promise<void> {
  const dirty = [...client.markovDirty];

  if (dirty.length === 0) return;

  client.markovDirty.clear();

  for (const guildId of dirty) {
    const data = client.markovChains.get(guildId) ?? "";

    try {
      await client.prisma.markovChain.upsert({
        where: { guildId },
        create: { guildId, data },
        update: { data, messageCount: { increment: 1 } },
      });
    } catch (error) {
      client.logger.error("Failed to flush Markov chain", {
        error,
        guildId,
      });
    }
  }
}

let flushStarted = false;

/**
 * Start the 30s background flush. Idempotent — safe to call from every
 * learned message.
 */
export function startMarkovFlush(client: Client): void {
  if (flushStarted) return;

  flushStarted = true;

  setInterval(() => {
    void flushDirtyChains(client);
  }, 30_000);
}

/**
 * Delete a guild's chain from both Postgres and the cache.
 */
export async function clearChain(
  client: Client,
  guildId: string,
): Promise<void> {
  await client.prisma.markovChain.deleteMany({ where: { guildId } });

  client.markovChains.set(guildId, "");
  client.markovDirty.delete(guildId);
}

function pickWeighted(transitions: Record<string, number>): string | null {
  const entries = Object.entries(transitions);

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  let roll = Math.random() * total;

  for (const [next, count] of entries) {
    roll -= count;
    if (roll <= 0) return next;
  }

  return entries[0]?.[0] ?? null;
}

function randomSeedKey(chain: ChainMap): string | null {
  const seeds = Object.keys(chain).filter(
    (key) => key.startsWith(START) && key !== START_KEY,
  );

  if (seeds.length === 0) return null;

  return seeds[Math.floor(Math.random() * seeds.length)]!;
}

/**
 * Generate a sentence by walking the guild's chain. Returns null when the
 * guild has no chain or the requested seed word is unknown.
 */
export function generateMarkov(
  chain: ChainMap,
  seed?: string,
  maxWords = 25,
): string | null {
  const startKey =
    seed !== undefined
      ? `${START} ${seed.toLowerCase()}`
      : randomSeedKey(chain);

  if (!startKey || !chain[startKey]) return null;

  const words: string[] = [];

  let prev = startKey;

  while (words.length < maxWords) {
    const next = pickWeighted(chain[prev] ?? {});

    if (next === null || next === END) break;

    words.push(next);

    const last = prev.split(" ")[1]!;
    prev = `${last} ${next}`;
  }

  if (words.length === 0) return null;

  const sentence = words.join(" ");

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
