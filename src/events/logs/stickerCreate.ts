import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "stickerCreate",

  async execute(client, sticker) {
    const guild =
      sticker.guild ?? client.guilds.cache.get(sticker.guildId ?? "");

    if (!guild) return;

    const audit = await findAuditLogExecutor(
      guild,
      AuditLogEvent.StickerCreate,
      sticker.id,
    );

    const container = buildLogEntry({
      category: "images",
      title: "Sticker created",
      description: `\`${sticker.name}\``,
      footer: [
        `Sticker ID: ${sticker.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: guild.id,
      category: "images",
      ignoreTargets: [sticker.id, audit?.executor?.id],
      container,
    });
  },
});
