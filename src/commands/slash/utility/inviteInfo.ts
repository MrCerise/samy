import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { InviteInfo } from "@/commands/shared/inviteInfo";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("inviteinfo")
    .setDescription("Get information about a Discord invite.")
    .addStringOption((option) =>
      option
        .setName("invite")
        .setDescription("The invite code or link")
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
    const raw = interaction.options.getString("invite", true);

    await interaction.deferReply();

    try {
      const container = await InviteInfo(client, raw);

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch invite info", { error, raw });

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.inviteinfo.fetch_error"))],
      });
    }
  },
});
