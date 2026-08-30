import { AuditLogEvent, OverwriteType } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "channelUpdate",

  async execute(client, oldChannel, newChannel) {
    if (!("guild" in newChannel) || !newChannel.guild) return;

    const fields: { name: string; value: string }[] = [];

    if (
      "name" in oldChannel &&
      "name" in newChannel &&
      oldChannel.name !== newChannel.name
    ) {
      fields.push({
        name: "Name",
        value: `\`${oldChannel.name}\` → \`${newChannel.name}\``,
      });
    }

    if (
      "permissionOverwrites" in oldChannel &&
      "permissionOverwrites" in newChannel
    ) {
      const oldOverwrites = oldChannel.permissionOverwrites.cache;
      const newOverwrites = newChannel.permissionOverwrites.cache;

      const changedIds = new Set<string>();

      for (const [id, overwrite] of newOverwrites) {
        const previous = oldOverwrites.get(id);

        if (
          !previous ||
          previous.allow.bitfield !== overwrite.allow.bitfield ||
          previous.deny.bitfield !== overwrite.deny.bitfield
        ) {
          changedIds.add(id);
        }
      }

      for (const id of oldOverwrites.keys()) {
        if (!newOverwrites.has(id)) changedIds.add(id);
      }

      if (changedIds.size > 0) {
        const lines = [...changedIds].map((id) => {
          const overwrite = newOverwrites.get(id) ?? oldOverwrites.get(id);
          return overwrite?.type === OverwriteType.Role
            ? `<@&${id}>`
            : `<@${id}>`;
        });

        fields.push({
          name: "Permission overwrites changed",
          value: lines.join("\n"),
        });
      }
    }

    if (fields.length === 0) return;

    const audit = await findAuditLogExecutor(
      newChannel.guild,
      AuditLogEvent.ChannelUpdate,
      newChannel.id,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Channel updated",
      description: newChannel.toString(),
      fields,
      footer: [
        `Channel ID: ${newChannel.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: newChannel.guild.id,
      category: "channels",
      sourceChannelId: newChannel.id,
      ignoreTargets: [newChannel.id, newChannel.parentId, audit?.executor?.id],
      container,
    });
  },
});
