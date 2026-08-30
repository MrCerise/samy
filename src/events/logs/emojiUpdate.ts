import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "emojiUpdate",

  async execute(client, oldEmoji, newEmoji) {
    if (!newEmoji.guild) return;

    const fields: { name: string; value: string }[] = [];

    if (oldEmoji.name !== newEmoji.name) {
      fields.push({
        name: "Name",
        value: `\`${oldEmoji.name}\` → \`${newEmoji.name}\``,
      });
    }

    if (oldEmoji.available !== newEmoji.available) {
      fields.push({
        name: "Available",
        value: `${oldEmoji.available ? "Yes" : "No"} → ${newEmoji.available ? "Yes" : "No"}`,
      });
    }

    if (fields.length === 0) return;

    const audit = await findAuditLogExecutor(
      newEmoji.guild,
      AuditLogEvent.EmojiUpdate,
      newEmoji.id,
    );

    const container = buildLogEntry({
      category: "images",
      title: "Emoji updated",
      description: newEmoji.toString(),
      fields,
      footer: [
        `Emoji ID: ${newEmoji.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: newEmoji.guild.id,
      category: "images",
      ignoreTargets: [newEmoji.id, audit?.executor?.id],
      container,
    });
  },
});
