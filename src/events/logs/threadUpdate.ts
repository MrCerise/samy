import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "threadUpdate",

  async execute(client, oldThread, newThread) {
    if (!("guild" in newThread) || !newThread.guild) return;

    const fields: { name: string; value: string }[] = [];

    if (oldThread.name !== newThread.name) {
      fields.push({
        name: "Name",
        value: `\`${oldThread.name}\` → \`${newThread.name}\``,
      });
    }

    if (oldThread.archived !== newThread.archived) {
      fields.push({
        name: "Archived",
        value: `${oldThread.archived ? "Yes" : "No"} → ${newThread.archived ? "Yes" : "No"}`,
      });
    }

    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
      fields.push({
        name: "Auto-archive",
        value: `${oldThread.autoArchiveDuration}m → ${newThread.autoArchiveDuration}m`,
      });
    }

    if (oldThread.locked !== newThread.locked) {
      fields.push({
        name: "Locked",
        value: `${oldThread.locked ? "Yes" : "No"} → ${newThread.locked ? "Yes" : "No"}`,
      });
    }

    if (fields.length === 0) return;

    const audit = await findAuditLogExecutor(
      newThread.guild,
      AuditLogEvent.ThreadUpdate,
      newThread.id,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Thread updated",
      description: newThread.toString(),
      fields,
      footer: [
        `Thread ID: ${newThread.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: newThread.guild.id,
      category: "channels",
      sourceChannelId: newThread.id,
      ignoreTargets: [newThread.id, newThread.parentId, audit?.executor?.id],
      container,
    });
  },
});
