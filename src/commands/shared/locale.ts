import type Client from "@/classes/client";

export async function getLocale(
  client: Client,
  userId: string,
): Promise<string | null> {
  const user = await client.prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  return user?.locale ?? null;
}

export async function setLocale(
  client: Client,
  userId: string,
  input: string,
): Promise<string> {
  const locale = resolveSupportedLocale(client, input);

  if (!locale) {
    throw new Error(
      `${client.i18n.t("commands.locale.invalid")} ${client.i18n.t(
        "commands.locale.available",
        { locales: client.i18n.availableLocales().join(", ") },
      )}`,
    );
  }

  await client.prisma.user.upsert({
    where: { id: userId },
    update: { locale },
    create: { id: userId, locale },
  });

  client.i18n.invalidateUserLocale(userId);

  return locale;
}

export async function unsetLocale(
  client: Client,
  userId: string,
): Promise<boolean> {
  const existing = await client.prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  });

  if (!existing?.locale) return false;

  await client.prisma.user.update({
    where: { id: userId },
    data: { locale: null },
  });

  client.i18n.invalidateUserLocale(userId);

  return true;
}

export async function getGuildLocale(
  client: Client,
  guildId: string,
): Promise<string | null> {
  const guild = await client.prisma.guild.findUnique({
    where: { id: guildId },
    select: { locale: true },
  });

  return guild?.locale ?? null;
}

export async function setGuildLocale(
  client: Client,
  guildId: string,
  input: string,
): Promise<string> {
  const locale = resolveSupportedLocale(client, input);

  if (!locale) {
    throw new Error(
      `${client.i18n.t("commands.locale.invalid")} ${client.i18n.t(
        "commands.locale.available",
        { locales: client.i18n.availableLocales().join(", ") },
      )}`,
    );
  }

  await client.prisma.guild.upsert({
    where: { id: guildId },
    update: { locale },
    create: { id: guildId, locale },
  });

  client.i18n.invalidateGuildLocale(guildId);

  return locale;
}

export async function unsetGuildLocale(
  client: Client,
  guildId: string,
): Promise<boolean> {
  const existing = await client.prisma.guild.findUnique({
    where: { id: guildId },
    select: { locale: true },
  });

  if (!existing?.locale) return false;

  await client.prisma.guild.update({
    where: { id: guildId },
    data: { locale: null },
  });

  client.i18n.invalidateGuildLocale(guildId);

  return true;
}

function resolveSupportedLocale(client: Client, input: string): string | null {
  const available = client.i18n.availableLocales();
  const normalized = input.trim();

  const exact = available.find(
    (locale) => locale.toLowerCase() === normalized.toLowerCase(),
  );

  if (exact) return exact;

  const [lang] = normalized.split(/[-_]/);

  if (!lang) return null;

  return (
    available.find((locale) =>
      locale.toLowerCase().startsWith(`${lang.toLowerCase()}-`),
    ) ?? null
  );
}
