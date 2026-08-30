import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { EmojiInfo } from "@/commands/shared/emoji";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Get information about an emoji.")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The emoji to get information about")
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

  category: "Utility",

  async execute(client, interaction) {
    const raw = interaction.options.getString("emoji", true).trim();

    try {
      const container = EmojiInfo(client, raw, interaction.guild);

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch emoji info", { error, raw });

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(client.i18n.t("commands.emojiinfo.fetch_error"))],
      });
    }
  },
});
