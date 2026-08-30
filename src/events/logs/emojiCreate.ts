import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "emojiCreate",

  async execute(client, emoji) {
    if (!emoji.guild) return;

    const audit = await findAuditLogExecutor(
      emoji.guild,
      AuditLogEvent.EmojiCreate,
      emoji.id,
    );

    const container = buildLogEntry({
      category: "images",
      title: "Emoji created",
      description: `${emoji.toString()} (\`${emoji.name}\`)`,
      footer: [
        `Emoji ID: ${emoji.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: emoji.guild.id,
      category: "images",
      ignoreTargets: [emoji.id, audit?.executor?.id],
      container,
    });
  },
});
