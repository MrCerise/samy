import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { ensureGuild } from "@/utils/guild";

export default new Event({
  name: "guildCreate",

  async execute(client, guild) {
    const container = buildLogEntry({
      category: "guild",
      title: "Joined guild",
      description: `**${guild.name}** (\`${guild.id}\`)`,
      fields: [
        { name: "Members", value: `${guild.memberCount.toLocaleString()}` },
        { name: "Owner", value: `<@${guild.ownerId}>` },
      ],
      footer: `Guild ID: ${guild.id}`,
    });

    await sendLog(client, {
      guildId: guild.id,
      category: "guild",
      ignoreTargets: [guild.ownerId],
      container,
    });
  },
});
