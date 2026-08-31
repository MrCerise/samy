import prisma from "@/libs/prisma";

const ensuredUsers = new Map<string, Promise<void>>();
const ensuredGuilds = new Map<string, Promise<void>>();

export function ensureGuild(guildId: string): Promise<void> {
  const existing = ensuredGuilds.get(guildId);

  if (existing) {
    return existing;
  }

  const promise = prisma.guild
    .upsert({
      where: {
        id: guildId,
      },
      update: {},
      create: {
        id: guildId,
      },
    })
    .then(() => undefined)
    .finally(() => {
      ensuredGuilds.delete(guildId);
    });

  ensuredGuilds.set(guildId, promise);

  return promise;
}

export function ensureUser(userId: string): Promise<void> {
  const existing = ensuredUsers.get(userId);

  if (existing) {
    return existing;
  }

  const promise = prisma.user
    .upsert({
      where: {
        id: userId,
      },
      update: {},
      create: {
        id: userId,
      },
    })
    .then(() => undefined)
    .finally(() => {
      ensuredUsers.delete(userId);
    });

  ensuredUsers.set(userId, promise);

  return promise;
}
