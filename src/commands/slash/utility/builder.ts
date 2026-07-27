import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import {
  detectScriptKind,
  mergeMessageContent,
} from "@/libs/scripting/detectScriptKind";
import { compileEmbedScript } from "@/libs/scripting/embed";
import { replaceVariables } from "@/libs/scripting/variables";
import errorUI from "@/ui/error";
import { resolveLocale } from "@/libs/i18n";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("builder")
    .setDescription("Build and send a text, embed, or Components V2 message.")
    .addStringOption((option) =>
      option
        .setName("script")
        .setDescription("Plain text, an {embed} script, or a {cv2} script.")
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
  botPermissions: ["SendMessages", "EmbedLinks"],

  async execute(client, interaction) {
    const locale = resolveLocale({
      guildLocale: interaction.guildLocale,
      interactionLocale: interaction.locale,
    });
    const raw = interaction.options.getString("script", true).trim();

    const script = replaceVariables(raw, {
      user: interaction.user,
      guild: interaction.guild,
    });

    const detected = detectScriptKind(script);

    if (detected.kind === "text") {
      await interaction.reply(detected.source);
      return;
    }

    if (!detected.source && !detected.content) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(
            detected.kind === "embed"
              ? client.i18n.t(locale, "commands.builder.missing_embed")
              : client.i18n.t(locale, "commands.builder.missing_cv2"),
          ),
        ],
      });

      return;
    }

    if (detected.kind === "embed") {
      if (!detected.source) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [
            errorUI(
              client.i18n.t(locale, "commands.builder.missing_embed_example"),
            ),
          ],
        });

        return;
      }

      const compiled = compileEmbedScript(detected.source);

      if (!compiled.success) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          components: [errorUI(compiled.error.message)],
        });

        return;
      }

      const content = mergeMessageContent(
        detected.content,
        compiled.result.content,
      );

      await interaction.reply({
        ...(content ? { content } : {}),
        embeds: [compiled.result.embed],
        ...(compiled.result.components.length > 0
          ? {
              components: compiled.result.components,
            }
          : {}),
      });

      return;
    }

    if (!detected.source) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(
            client.i18n.t(locale, "commands.builder.missing_cv2_example"),
          ),
        ],
      });

      return;
    }

    const compiled = compileCv2Script(detected.source, {
      prependText: detected.content,
    });

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
