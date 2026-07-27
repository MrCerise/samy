import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { PingCommand } from "@/commands/shared/ping";

import { Container, Text } from "@/ui/components";
import { resolveLocale } from "@/libs/i18n";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName(PingCommand.name)
    .setDescription(PingCommand.description)
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    )
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ),

  category: PingCommand.category,

  async execute(client, interaction) {
    const locale = resolveLocale({
      guildLocale: interaction.guildLocale,
      interactionLocale: interaction.locale,
    });
    const sent = await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text(
            client.i18n.t(locale, "commands.ping.latency", {
              latency: client.ws.ping,
            }),
          ),
        ),
      ],
      withResponse: true,
    });

    if (!sent.resource?.message) return;

    const latency =
      sent.resource.message.createdTimestamp - interaction.createdTimestamp;

    const page = new Container().text(
      Text(
        client.i18n.t(locale, "commands.ping.latency", {
          latency: client.ws.ping,
        }),
      ),
      Text(client.i18n.t(locale, "commands.ping.edit", { latency })),
    );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [page],
    });
  },
});
