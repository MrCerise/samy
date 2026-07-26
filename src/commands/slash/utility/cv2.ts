import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("cv2")
    .setDescription("Build and send a Components V2 message.")
    .addStringOption((option) =>
      option
        .setName("script")
        .setDescription(
          "CV2 script, e.g. {container}$v{text: Hello}$v{button: Click && https://discord.com}",
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

  async execute(_client, interaction) {
    const script = interaction.options.getString("script", true).trim();

    if (!script) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(
            "Provide a Components V2 script.\nExample: `{container}$v{text: Hello}$v{separator}$v{section}$v{text: Welcome}$v{button: Click && https://discord.com}`",
          ),
        ],
      });
      return;
    }

    const compiled = compileCv2Script(script);

    if (!compiled.success) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(compiled.error.message)],
      });
      return;
    }

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: compiled.result.components,
    });
  },
});
