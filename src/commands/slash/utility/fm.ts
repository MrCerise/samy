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
                  ? client.i18n.t("commands.lastfm.no_link")
                  : client.i18n.t("commands.lastfm.user_no_link"),
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
          components: [
            new Container().text(
              Text(client.i18n.t("commands.lastfm.no_tracks")),
            ),
          ],
        });

        return;
      }

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          LastFMNowUI(nowPlaying, (key, variables) =>
            client.i18n.t(key, variables),
          ),
        ],
      });
    } catch (error) {
      client.logger.error("Failed to get Last.fm track", {
        error,
        user: interaction.user.id,
      });

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.lastfm.fetch_error"))],
      });
    }
  },
});
