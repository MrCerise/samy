import type { Guild } from "discord.js";

import type Client from "@/classes/client";
import {
  ActionRow,
  Buttons,
  Container,
  Media,
  Separator,
  Text,
} from "@/ui/components";
import errorUI from "@/ui/error";

export function GuildBanner(client: Client, guild: Guild) {
  const bannerURL = guild.bannerURL({ size: 1024 });

  if (!bannerURL) {
    return errorUI(client.i18n.t("commands.guildbanner.none"));
  }

  return new Container()
    .text(
      Text(client.i18n.t("commands.guildbanner.title", { name: guild.name })),
    )
    .media(Media(bannerURL))
    .separator(Separator())
    .actionRow(
      ActionRow(Buttons.link(client.i18n.t("general.browser"), bannerURL)),
    );
}
