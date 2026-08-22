import type { Guild } from "discord.js";

import type Client from "@/classes/client";
import { Container, Text } from "@/ui/components";

export function MemberCount(client: Client, guild: Guild) {
  const humans = guild.members.cache.filter((m) => !m.user.bot).size;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;

  return new Container().text(
    Text(
      client.i18n.t("commands.membercount.details", {
        guild: guild.name,
        total: guild.memberCount.toLocaleString(),
        humans: humans.toLocaleString(),
        bots: bots.toLocaleString(),
      }),
    ),
  );
}
