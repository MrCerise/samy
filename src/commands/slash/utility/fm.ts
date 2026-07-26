import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { LastFMNow, LastFMNowUsername } from "@/commands/shared/lastfm";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";
import LastFMNowUI from "@/ui/lastfm/now";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("fm")
    .setDescription("View your currently playing or last played")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "Discord user to view (must have a linked Last.fm account).",
        )
        .setRequired(false),
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

  category: "Utility",

  async execute(client, interaction) {
    await interaction.deferReply();

    try {
      const userOption = interaction.options.getUser("user");

      let nowPlaying;

      if (userOption) {
        const linkedUser = await client.lastFm.getUser(userOption.id);

        if (!linkedUser) {
          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                userOption.id === interaction.user.id
                  ? "You don't have a Last.fm account linked."
                  : "That user doesn't have a Last.fm account linked.",
              ),
            ],
          });

          return;
        }

        nowPlaying = await LastFMNowUsername(linkedUser.username);
      } else {
        nowPlaying = await LastFMNow(client, interaction.user.id);
      }

      if (!nowPlaying) {
        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [new Container().text(Text("No recent tracks found."))],
        });

        return;
      }

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [LastFMNowUI(nowPlaying)],
      });
    } catch (error) {
      client.logger.error("Failed to get Last.fm track", {
        error,
        user: interaction.user.id,
      });

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            "I couldn't find that Last.fm profile or get its recent tracks.",
          ),
        ],
      });
    }
  },
});
