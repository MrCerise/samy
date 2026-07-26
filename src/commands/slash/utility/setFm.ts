import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { LastFMLink } from "@/commands/shared/lastfm";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("setfm")
    .setDescription("Link your Last.fm profile to the bot")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Your Last.fm username.")
        .setRequired(true),
    )
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    )
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ),

  category: "Last.fm",

  async execute(client, interaction) {
    const username = interaction.options.getString("username", true);

    await interaction.deferReply();

    try {
      const profile = await LastFMLink(client, interaction.user.id, username);

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(`Linked your Last.fm account as **${profile.name}**.`),
          ),
        ],
      });
    } catch (error) {
      client.logger.error("Failed to link Last.fm account", {
        error,
        user: interaction.user.id,
        username,
      });

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            "I couldn't link that Last.fm account. Double-check the username and make sure the profile is public.",
          ),
        ],
      });
    }
  },
});
