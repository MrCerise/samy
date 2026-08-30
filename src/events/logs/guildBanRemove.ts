import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "guildBanRemove",

  async execute(client, ban) {
    const audit = await findAuditLogExecutor(
      ban.guild,
      AuditLogEvent.MemberBanRemove,
      ban.user.id,
    );

    const container = buildLogEntry({
      category: "moderation",
      title: "Member unbanned",
      thumbnail: ban.user.displayAvatarURL(),
      description: `**${ban.user.tag}**`,
      fields: audit?.reason
        ? [{ name: "Reason", value: audit.reason }]
        : undefined,
      footer: [
        `User ID: ${ban.user.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: ban.guild.id,
      category: "moderation",
      ignoreTargets: [ban.user.id, audit?.executor?.id],
      container,
    });
  },
});
