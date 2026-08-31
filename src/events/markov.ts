import Event from "@/classes/Event";
import { getGuildPrefix, getUserPrefix } from "@/utils/settings";
import {
  getMarkovSettings,
  getChain,
  learnMarkov,
  generateMarkov,
  startMarkovFlush,
  isMarkovChannelWhitelisted,
  type MarkovSettings,
} from "@/utils/markov";
import type Client from "@/classes/client";
import type { Message } from "discord.js";

const MENTION_STRIP_REGEX = /<@!?\d+>/g;

export default new Event({
  name: "messageCreate",

  async execute(client, message) {
    if (message.author.bot) {
      client.logger.debug(
        { messageId: message.id, authorId: message.author.id },
        "Ignoring bot message",
      );
      return;
    }

    if (!message.guild) {
      client.logger.debug(
        { messageId: message.id },
        "Ignoring non-guild message",
      );
      return;
    }

    if (!message.channel.isTextBased() || !("guild" in message.channel)) {
      client.logger.debug(
        {
          messageId: message.id,
          channelId: message.channelId,
        },
        "Ignoring non-text or invalid guild channel",
      );
      return;
    }

    const content = message.content.trim();

    if (!content) {
      client.logger.debug({ messageId: message.id }, "Ignoring empty message");
      return;
    }

    client.logger.debug(
      {
        messageId: message.id,
        guildId: message.guild.id,
        channelId: message.channelId,
        authorId: message.author.id,
        contentLength: content.length,
      },
      "Processing message for Markov",
    );

    const [guildPrefix, userPrefix] = await Promise.all([
      getGuildPrefix(message.guild.id, client),
      getUserPrefix(message.author.id, client),
    ]);

    const prefixes = [userPrefix, guildPrefix, client.prefix].filter(
      (p): p is string => p !== null && p !== undefined && p.length > 0,
    );

    if (prefixes.some((p) => content.startsWith(p))) {
      client.logger.debug(
        {
          messageId: message.id,
          guildId: message.guild.id,
          prefixes,
        },
        "Ignoring message because it starts with a command prefix",
      );
      return;
    }

    const settings = await getMarkovSettings(message.guild.id, client);

    client.logger.debug(
      {
        guildId: message.guild.id,
        enabled: settings.enabled,
        mentionEnabled: settings.mentionEnabled,
        randomEnabled: settings.randomEnabled,
        randomFrequency: settings.randomFrequency,
        randomCooldown: settings.randomCooldown,
        chainOrder: settings.chainOrder,
        minOutputLength: settings.minOutputLength,
        maxOutputLength: settings.maxOutputLength,
      },
      "Loaded Markov settings",
    );

    if (!settings.enabled) {
      client.logger.debug(
        { guildId: message.guild.id },
        "Markov is disabled for guild",
      );
      return;
    }

    const parentId =
      "parentId" in message.channel ? message.channel.parentId : undefined;

    const whitelisted = await isMarkovChannelWhitelisted(
      message.guild.id,
      message.channelId,
      parentId,
      client,
    );

    client.logger.debug(
      {
        guildId: message.guild.id,
        channelId: message.channelId,
        parentId,
        whitelisted,
      },
      "Checked Markov channel whitelist",
    );

    if (!whitelisted) {
      client.logger.debug(
        {
          guildId: message.guild.id,
          channelId: message.channelId,
        },
        "Ignoring message because channel is not whitelisted",
      );
      return;
    }

    await learnMarkov(client, message.guild.id, content, settings.chainOrder);

    client.logger.debug(
      {
        guildId: message.guild.id,
        messageId: message.id,
        chainOrder: settings.chainOrder,
      },
      "Learned message into Markov chain",
    );

    startMarkovFlush(client);

    const mentioned = message.mentions.users.has(client.user!.id);

    client.logger.debug(
      {
        messageId: message.id,
        guildId: message.guild.id,
        mentioned,
        mentionEnabled: settings.mentionEnabled,
      },
      "Checked bot mention",
    );

    if (mentioned && settings.mentionEnabled) {
      client.logger.debug(
        {
          messageId: message.id,
          guildId: message.guild.id,
        },
        "Generating Markov mention response",
      );

      await respondWithMarkov(client, message, settings, content);
      return;
    }

    if (settings.randomEnabled) {
      await maybeSendRandom(client, message, settings);
    } else {
      client.logger.debug(
        { guildId: message.guild.id },
        "Random Markov responses are disabled",
      );
    }
  },
});

async function respondWithMarkov(
  client: Client,
  message: Message,
  settings: MarkovSettings,
  content: string,
): Promise<void> {
  const guildId = message.guild!.id;

  const chain = await getChain(client, guildId);

  if (!chain) {
    client.logger.debug(
      { guildId },
      "Could not generate mention response: Markov chain is empty",
    );
    return;
  }

  const cleaned = content.replace(MENTION_STRIP_REGEX, "").trim();
  const seedCandidate = cleaned.split(/\s+/).filter(Boolean)[0];

  client.logger.debug(
    {
      guildId,
      messageId: message.id,
      cleanedLength: cleaned.length,
      seedCandidate,
      chainOrder: settings.chainOrder,
      minOutputLength: settings.minOutputLength,
      maxOutputLength: settings.maxOutputLength,
    },
    "Preparing Markov mention generation",
  );

  const sentence =
    (seedCandidate &&
      generateMarkov(
        chain,
        settings.chainOrder,
        seedCandidate,
        settings.minOutputLength,
        settings.maxOutputLength,
      )) ||
    generateMarkov(
      chain,
      settings.chainOrder,
      undefined,
      settings.minOutputLength,
      settings.maxOutputLength,
    );

  if (!sentence) {
    client.logger.debug(
      {
        guildId,
        messageId: message.id,
        seedCandidate,
      },
      "Markov generation returned no sentence",
    );
    return;
  }

  client.logger.debug(
    {
      guildId,
      messageId: message.id,
      sentenceLength: sentence.length,
      usedSeed: Boolean(seedCandidate),
    },
    "Generated Markov mention response",
  );

  await message.reply({
    content: sentence,
    allowedMentions: { repliedUser: false },
  });

  client.logger.debug(
    {
      guildId,
      messageId: message.id,
    },
    "Sent Markov mention response",
  );
}

async function maybeSendRandom(
  client: Client,
  message: Message,
  settings: MarkovSettings,
): Promise<void> {
  const guildId = message.guild!.id;
  const frequency = Math.max(settings.randomFrequency, 1);

  const roll = Math.floor(Math.random() * frequency);

  client.logger.debug(
    {
      guildId,
      messageId: message.id,
      frequency,
      roll,
    },
    "Checking random Markov response",
  );

  if (roll !== 0) {
    client.logger.debug(
      {
        guildId,
        frequency,
        roll,
      },
      "Random Markov response skipped by frequency",
    );
    return;
  }

  const now = Date.now();
  const last = client.markovLastRandom.get(guildId) ?? 0;
  const cooldownMs = Math.max(settings.randomCooldown, 0) * 1000;
  const elapsedMs = now - last;

  client.logger.debug(
    {
      guildId,
      lastRandom: last || null,
      elapsedMs,
      cooldownMs,
    },
    "Checking random Markov cooldown",
  );

  if (elapsedMs < cooldownMs) {
    client.logger.debug(
      {
        guildId,
        remainingMs: cooldownMs - elapsedMs,
      },
      "Random Markov response skipped because of cooldown",
    );
    return;
  }

  const chain = await getChain(client, guildId);

  if (!chain) {
    client.logger.debug(
      { guildId },
      "Could not generate random response: Markov chain is empty",
    );
    return;
  }

  const sentence = generateMarkov(
    chain,
    settings.chainOrder,
    undefined,
    settings.minOutputLength,
    settings.maxOutputLength,
  );

  if (!sentence) {
    client.logger.debug(
      { guildId },
      "Random Markov generation returned no sentence",
    );
    return;
  }

  client.markovLastRandom.set(guildId, now);

  if (!message.channel.isSendable()) {
    client.logger.debug(
      {
        guildId,
        channelId: message.channelId,
      },
      "Could not send random Markov response: channel is not sendable",
    );
    return;
  }

  await message.channel.send({ content: sentence });

  client.logger.debug(
    {
      guildId,
      channelId: message.channelId,
      sentenceLength: sentence.length,
    },
    "Sent random Markov response",
  );
}
