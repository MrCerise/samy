import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "messageDelete",

  async execute(client, message) {
    if (!message.guild) return;
    if (message.author?.bot) return;

    if (message.partial) return;

    const container = buildLogEntry({
      category: "messages",
      title: "Message deleted",
      thumbnail: message.author?.displayAvatarURL(),
      description: `**${message.author?.tag ?? "Unknown user"}** in <#${message.channelId}>\n${
        message.content || "*No text content (embed/attachment only)*"
      }`,
      fields:
        message.attachments.size > 0
          ? [
              {
                name: "Attachments",
                value: message.attachments.map((a) => a.url).join("\n"),
              },
            ]
          : undefined,
      footer: `Author: ${message.author?.id ?? "unknown"} • Message ID: ${message.id}`,
    });

    await sendLog(client, {
      guildId: message.guild.id,
      category: "messages",
      sourceChannelId: message.channelId,
      ignoreTargets: [message.author?.id, message.channelId],
      container,
    });
  },
});
