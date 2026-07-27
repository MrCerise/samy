import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import {
  detectScriptKind,
  mergeMessageContent,
} from "@/libs/scripting/detectScriptKind";
import { compileEmbedScript } from "@/libs/scripting/embed";
import { extractRawScript } from "@/libs/scripting/extractRawScript";
import { replaceVariables } from "@/libs/scripting/variables";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "builder",
  aliases: ["build"],
  description: "Build and send a text, embed, or Components V2 message.",
  category: "Utility",

  arguments: [
    {
      name: "message",
      aliases: ["m"],
      type: "string",
      description: "Plain text, an {embed} script, or a {cv2} script.",
      required: true,
    },
  ],

  botPermissions: ["SendMessages", "EmbedLinks"],

  async execute(client, message) {
    const raw = extractRawScript(message.content, client.prefix);

    if (!raw) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            client.i18n.t("en-US", "commands.builder.provide_message"),
          ),
        ],
      });

      return;
    }

    const script = replaceVariables(raw, {
      user: message.author,
      guild: message.guild,
    });

    const detected = detectScriptKind(script);

    if (detected.kind === "text") {
      await message.reply(detected.source);
      return;
    }

    if (!detected.source && !detected.content) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            detected.kind === "embed"
              ? client.i18n.t("en-US", "commands.builder.missing_embed")
              : client.i18n.t("en-US", "commands.builder.missing_cv2"),
          ),
        ],
      });

      return;
    }

    if (detected.kind === "embed") {
      if (!detected.source) {
        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            errorUI(
              client.i18n.t("en-US", "commands.builder.missing_embed_example"),
            ),
          ],
        });

        return;
      }

      const compiled = compileEmbedScript(detected.source);

      if (!compiled.success) {
        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [errorUI(compiled.error.message)],
        });

        return;
      }

      const content = mergeMessageContent(
        detected.content,
        compiled.result.content,
      );

      await message.reply({
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
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            client.i18n.t("en-US", "commands.builder.missing_cv2_example"),
          ),
        ],
      });

      return;
    }

    const compiled = compileCv2Script(detected.source, {
      prependText: detected.content,
    });

    if (!compiled.success) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(compiled.error.message)],
      });

      return;
    }

    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: compiled.result.components,
    });
  },
});
