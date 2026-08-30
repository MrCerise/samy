import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "inviteDelete",

  async execute(client, invite) {
    const guildId = invite.guild?.id;
    if (!guildId) return;

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const audit = await findAuditLogExecutor(
      guild,
      AuditLogEvent.InviteDelete,
      invite.code,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Invite deleted",
      description: `Code: \`${invite.code}\``,
      fields: [
        {
          name: "Channel",
          value: invite.channel ? invite.channel.toString() : "*unknown*",
        },
      ],
      footer: [
        `Invite code: ${invite.code}`,
        audit?.executor ? `By: ${audit.executor.tag}` : null,
      ]
        .filter(Boolean)
        .join(" • "),
    });

    await sendLog(client, {
      guildId: guild.id,
      category: "channels",
      sourceChannelId: invite.channelId ?? undefined,
      ignoreTargets: [
        invite.channelId ?? undefined,
        invite.inviterId,
        audit?.executor?.id,
      ],
      container,
    });
  },
});
