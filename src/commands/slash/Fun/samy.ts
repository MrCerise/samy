import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { SamyResult } from "@/commands/shared/samy";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("samy")
    .setDescription("Get a random picture of Samy.")
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ),

  category: "Fun",

  async execute(client, interaction) {
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [await SamyResult(client, interaction.user.id)],
    });
  },
});
