import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "stageInstanceCreate",

  async execute(client, stageInstance) {
    if (!stageInstance.guild) return;
    if (!stageInstance.channel) return;

    const container = buildLogEntry({
      category: "voice",
      title: "Stage instance created",
      description: `**${stageInstance.topic}**`,
      fields: [{ name: "Channel", value: stageInstance.channel.toString() }],
      footer: `Stage ID: ${stageInstance.id}`,
    });

    await sendLog(client, {
      guildId: stageInstance.guild.id,
      category: "voice",
      sourceChannelId: stageInstance.channelId,
      ignoreTargets: [stageInstance.channelId],
      container,
    });
  },
});
