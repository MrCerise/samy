import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "webhookUpdate",

  async execute(client, channel) {
    if (!channel.guild) return;

    const audit = await findAuditLogExecutor(
      channel.guild,
      AuditLogEvent.WebhookUpdate,
      channel.id,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Webhook updated",
      description: channel.toString(),
      footer: [
        `Channel ID: ${channel.id}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: channel.guild.id,
      category: "channels",
      sourceChannelId: channel.id,
      ignoreTargets: [channel.id, channel.parentId, audit?.executor?.id],
      container,
    });
  },
});
