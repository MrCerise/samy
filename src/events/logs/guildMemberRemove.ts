import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "guildMemberRemove",

  async execute(client, member) {
    const audit = await findAuditLogExecutor(
      member.guild,
      AuditLogEvent.MemberKick,
      member.id,
    );

    const wasKicked = Boolean(audit?.executor);
    const category = wasKicked ? "moderation" : "members";

    const container = buildLogEntry({
      category,
      title: wasKicked ? "Member kicked" : "Member left",
      thumbnail: member.displayAvatarURL(),
      description: `**${member.user.tag}** (<@${member.id}>)`,
      fields: wasKicked
        ? [{ name: "Reason", value: audit?.reason ?? "*No reason provided*" }]
        : undefined,
      footer: [
        `User ID: ${member.id}`,
        wasKicked && audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: member.guild.id,
      category,
      ignoreTargets: [member.id, audit?.executor?.id],
      container,
    });
  },
});
