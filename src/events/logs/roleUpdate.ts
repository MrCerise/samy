import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "roleUpdate",

  async execute(client, oldRole, newRole) {
    const fields: { name: string; value: string }[] = [];

    if (oldRole.name !== newRole.name) {
      fields.push({
        name: "Name",
        value: `\`${oldRole.name}\` → \`${newRole.name}\``,
      });
    }

    if (oldRole.hexColor !== newRole.hexColor) {
      fields.push({
        name: "Color",
        value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``,
      });
    }

    if (oldRole.hoist !== newRole.hoist) {
      fields.push({
        name: "Hoisted",
        value: `${oldRole.hoist ? "Yes" : "No"} → ${newRole.hoist ? "Yes" : "No"}`,
      });
    }

    if (oldRole.mentionable !== newRole.mentionable) {
      fields.push({
        name: "Mentionable",
        value: `${oldRole.mentionable ? "Yes" : "No"} → ${newRole.mentionable ? "Yes" : "No"}`,
      });
    }

    if (!oldRole.permissions.equals(newRole.permissions)) {
      const added = newRole.permissions
        .toArray()
        .filter((permission) => !oldRole.permissions.has(permission));
      const removed = oldRole.permissions
        .toArray()
        .filter((permission) => !newRole.permissions.has(permission));

      if (added.length > 0) {
        fields.push({ name: "Permissions added", value: added.join(", ") });
      }

      if (removed.length > 0) {
        fields.push({ name: "Permissions removed", value: removed.join(", ") });
      }
    }

    if (fields.length === 0) return;

    const audit = await findAuditLogExecutor(
      newRole.guild,
      AuditLogEvent.RoleUpdate,
      newRole.id,
    );

    const container = buildLogEntry({
      category: "roles",
      title: "Role updated",
      description: newRole.toString(),
      fields,
      footer: [
        `Role ID: ${newRole.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: newRole.guild.id,
      category: "roles",
      ignoreTargets: [newRole.id, audit?.executor?.id],
      container,
    });
  },
});
