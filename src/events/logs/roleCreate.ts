import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "roleCreate",

  async execute(client, role) {
    const audit = await findAuditLogExecutor(
      role.guild,
      AuditLogEvent.RoleCreate,
      role.id,
    );

    const container = buildLogEntry({
      category: "roles",
      title: "Role created",
      description: `${role.toString()} (\`${role.name}\`)`,
      footer: [
        `Role ID: ${role.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: role.guild.id,
      category: "roles",
      ignoreTargets: [role.id, audit?.executor?.id],
      container,
    });
  },
});
