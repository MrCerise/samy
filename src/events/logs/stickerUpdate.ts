import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "stickerUpdate",

  async execute(client, oldSticker, newSticker) {
    const guild =
      newSticker.guild ?? client.guilds.cache.get(newSticker.guildId ?? "");

    if (!guild) return;

    const fields: { name: string; value: string }[] = [];

    if (oldSticker.name !== newSticker.name) {
      fields.push({
        name: "Name",
        value: `\`${oldSticker.name}\` → \`${newSticker.name}\``,
      });
    }

    if (oldSticker.description !== newSticker.description) {
      fields.push({
        name: "Description",
        value: `\`${oldSticker.description ?? "none"}\` → \`${newSticker.description ?? "none"}\``,
      });
    }

    if (oldSticker.tags !== newSticker.tags) {
      fields.push({
        name: "Tags",
        value: `\`${oldSticker.tags ?? "none"}\` → \`${newSticker.tags ?? "none"}\``,
      });
    }

    if (fields.length === 0) return;

    const audit = await findAuditLogExecutor(
      guild,
      AuditLogEvent.StickerUpdate,
      newSticker.id,
    );

    const container = buildLogEntry({
      category: "images",
      title: "Sticker updated",
      description: newSticker.name,
      fields,
      footer: [
        `Sticker ID: ${newSticker.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: guild.id,
      category: "images",
      ignoreTargets: [newSticker.id, audit?.executor?.id],
      container,
    });
  },
});
