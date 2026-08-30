import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "guildBanAdd",

  async execute(client, ban) {
    const container = buildLogEntry({
      category: "moderation",
      title: "Member banned",
      thumbnail: ban.user.displayAvatarURL(),
      description: `**${ban.user.tag}**`,
      fields: [{ name: "Reason", value: ban.reason ?? "*No reason provided*" }],
      footer: `User ID: ${ban.user.id}`,
    });

    await sendLog(client, {
      guildId: ban.guild.id,
      category: "moderation",
      ignoreTargets: [ban.user.id],
      container,
    });
  },
});
