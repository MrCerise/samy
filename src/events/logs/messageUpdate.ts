import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "messageUpdate",

  async execute(client, oldMessage, newMessage) {
    if (!newMessage.guild) return;
    if (newMessage.author?.bot) return;
    if (oldMessage.partial || newMessage.partial) return;

    if (oldMessage.content === newMessage.content) return;

    const container = buildLogEntry({
      category: "messages",
      title: "Message edited",
      thumbnail: newMessage.author?.displayAvatarURL(),
      description: `**${newMessage.author?.tag ?? "Unknown user"}** in <#${newMessage.channelId}>`,
      fields: [
        { name: "Before", value: oldMessage.content || "*empty*" },
        { name: "After", value: newMessage.content || "*empty*" },
      ],
      footer: `Author: ${newMessage.author?.id ?? "unknown"} • Message ID: ${newMessage.id}`,
    });

    await sendLog(client, {
      guildId: newMessage.guild.id,
      category: "messages",
      sourceChannelId: newMessage.channelId,
      ignoreTargets: [newMessage.author?.id, newMessage.channelId],
      container,
    });
  },
});
