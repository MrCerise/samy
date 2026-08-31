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

export function Splash(client: Client, guild: Guild) {
  const splashURL = guild.splashURL({ size: 1024 });

  if (!splashURL) {
    return errorUI(client.i18n.t("commands.splash.none"));
  }

  return new Container()
    .text(Text(client.i18n.t("commands.splash.title", { name: guild.name })))
    .media(Media(splashURL))
    .separator(Separator())
    .actionRow(
      ActionRow(Buttons.link(client.i18n.t("general.browser"), splashURL)),
    );
}
