import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "guildDelete",

  async execute(client, guild) {
    const container = buildLogEntry({
      category: "guild",
      title: "Left guild",
      description: `**${guild.name}** (\`${guild.id}\`)`,
      footer: `Guild ID: ${guild.id}`,
    });

    await sendLog(client, {
      guildId: guild.id,
      category: "guild",
      container,
    });
  },
});
