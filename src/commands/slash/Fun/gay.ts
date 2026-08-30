import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { GayResult } from "@/commands/shared/gay";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("gay")
    .setDescription("Check a user's gay percentage.")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to check"),
    )
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
    const user = interaction.options.getUser("user") ?? interaction.user;

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        users: [],
      },
      components: [GayResult(client, user)],
    });
  },
});
