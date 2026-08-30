import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "messageReactionRemoveAll",

  async execute(client, message) {
    if (!message.guild) return;
    if (message.partial) return;

    const container = buildLogEntry({
      category: "images",
      title: "All reactions cleared",
      description: `All reactions cleared in <#${message.channelId}>`,
      footer: `Message ID: ${message.id} • Channel ID: ${message.channelId}`,
    });

    await sendLog(client, {
      guildId: message.guild.id,
      category: "images",
      sourceChannelId: message.channelId,
      ignoreTargets: [message.channelId],
      container,
    });
  },
});
