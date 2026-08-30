import prisma from "@/libs/prisma";

const ensuredGuilds = new Set<string>();
const ensuredUsers = new Set<string>();

export async function ensureGuild(guildId: string): Promise<void> {
  if (ensuredGuilds.has(guildId)) return;

  await prisma.guild.upsert({
    where: { id: guildId },
    create: { id: guildId },
    update: {},
  });

  ensuredGuilds.add(guildId);
}

export async function ensureUser(userId: string): Promise<void> {
  if (ensuredUsers.has(userId)) return;

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });

  ensuredUsers.add(userId);
}
