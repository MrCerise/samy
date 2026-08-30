import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "channelCreate",

  async execute(client, channel) {
    const container = buildLogEntry({
      category: "channels",
      title: "Channel created",
      description: `${channel.toString()} (\`${channel.name}\`)`,
      footer: `Channel ID: ${channel.id} • Type: ${channel.type}`,
    });

    await sendLog(client, {
      guildId: channel.guild.id,
      category: "channels",
      ignoreTargets: [channel.id, channel.parentId],
      container,
    });
  },
});
