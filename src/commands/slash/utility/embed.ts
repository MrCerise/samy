import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { compileEmbedScript } from "@/libs/scripting/embed";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Build and send a Discord embed.")
    .addStringOption((option) =>
      option
        .setName("script")
        .setDescription(
          "Embed script, e.g. {title: Hello}$v{description: World}$v{color: #5865F2}",
        )
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
  botPermissions: ["EmbedLinks"],

  async execute(_client, interaction) {
    const script = interaction.options.getString("script", true).trim();

    if (!script) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(
            "Provide an embed script.\nExample: `{title: Hello}$v{description: World}$v{color: #5865F2}`",
          ),
        ],
      });
      return;
    }

    const compiled = compileEmbedScript(script);

    if (!compiled.success) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(compiled.error.message)],
      });
      return;
    }

    await interaction.reply({
      content: compiled.result.content,
      embeds: [compiled.result.embed],
      components: compiled.result.components,
    });
  },
});
