import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "threadDelete",

  async execute(client, thread) {
    if (!("guild" in thread) || !thread.guild) return;

    const audit = await findAuditLogExecutor(
      thread.guild,
      AuditLogEvent.ThreadDelete,
      thread.id,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Thread deleted",
      description: `\`${thread.name}\``,
      footer: [
        `Thread ID: ${thread.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: thread.guild.id,
      category: "channels",
      ignoreTargets: [thread.parentId, audit?.executor?.id],
      container,
    });
  },
});
