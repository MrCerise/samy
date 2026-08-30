import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "channelDelete",

  async execute(client, channel) {
    if (!("guild" in channel)) return;

    const container = buildLogEntry({
      category: "channels",
      title: "Channel deleted",
      description: `\`#${channel.name}\``,
      footer: `Channel ID: ${channel.id} • Type: ${channel.type}`,
    });

    await sendLog(client, {
      guildId: channel.guild.id,
      category: "channels",
      ignoreTargets: [channel.parentId],
      container,
    });
  },
});
