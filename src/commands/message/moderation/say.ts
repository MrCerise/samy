import { MessageFlags, type Message } from "discord.js";

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
import { LEADING_CHANNEL_MENTION } from "@/utils/constants";

export default new MessageCommand({
  name: "say",
  description:
    "Sends a message, embed script, or CV2 script to a channel as the bot.",
  category: "Moderation",
  guildOnly: true,
  botPermissions: ["SendMessages", "EmbedLinks"],
  userPermissions: ["ManageMessages"],

  arguments: [
    {
      name: "message",
      aliases: ["m"],
      type: "string",
      description:
        "Plain text, or an {embed}/{cv2} script. Optionally start with a #channel mention.",
      required: true,
    },
  ],

  async execute(client, message) {
    const raw = extractRawScript(message.content, client.prefix);

    if (!raw) {
      await replyError(
        message,
        "Provide a message to send.\nExamples:\n`,say Hello`\n`,say Hello {embed}$v{title: Hi}`\n`,say {cv2}$v{container}$v{text: Hello}`",
      );
      return;
    }

    let channel = message.channel;
    let body = raw;

    const mentionMatch = raw.match(LEADING_CHANNEL_MENTION);

    if (mentionMatch) {
      const channelId = mentionMatch[1]!;

      const targetChannel =
        message.guild?.channels.cache.get(channelId) ??
        (await message.guild?.channels.fetch(channelId).catch(() => null));

      if (!targetChannel) {
        await replyError(
          message,
          `I couldn't find a channel with ID "${channelId}".`,
        );
        return;
      }

      channel = targetChannel as typeof message.channel;
      body = raw.slice(mentionMatch[0].length);
    }

    if (!body.trim()) {
      await replyError(message, "You need to provide a message to send.");
      return;
    }

    if (!channel.isTextBased() || !("send" in channel)) {
      await replyError(message, "I can't send messages in that channel.");
      return;
    }

    // Replace variables before detecting/compiling scripts
    body = replaceVariables(body, {
      user: message.author,
      guild: message.guild!,
    });

    const detected = detectScriptKind(body);

    if (detected.kind === "text") {
      await channel.send(detected.source);
      return;
    }

    if (!detected.source && !detected.content) {
      await replyError(
        message,
        detected.kind === "embed"
          ? "Provide an embed script after `{embed}`.\nExample: `,say Hello {embed}$v{title: Hi}`"
          : "Provide a CV2 script after `{cv2}`.\nExample: `,say {cv2}$v{container}$v{text: Hi}`",
      );
      return;
    }

    if (detected.kind === "embed") {
      if (!detected.source) {
        await replyError(
          message,
          "Provide an embed script after `{embed}`.\nExample: `,say Hello {embed}$v{title: Hi}`",
        );
        return;
      }

      const compiled = compileEmbedScript(detected.source);

      if (!compiled.success) {
        await replyError(message, compiled.error.message);
        return;
      }

      const content = mergeMessageContent(
        detected.content,
        compiled.result.content,
      );

      await channel.send({
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
      await replyError(
        message,
        "Provide a CV2 script after `{cv2}`.\nExample: `,say {cv2}$v{container}$v{text: Hi}`",
      );
      return;
    }

    const compiled = compileCv2Script(detected.source, {
      prependText: detected.content,
    });

    if (!compiled.success) {
      await replyError(message, compiled.error.message);
      return;
    }

    await channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: compiled.result.components,
    });
  },
});

async function replyError(message: Message, text: string): Promise<void> {
  await message.reply({
    flags: MessageFlags.IsComponentsV2,
    components: [errorUI(text)],
  });
}
