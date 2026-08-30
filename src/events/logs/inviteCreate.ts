import { AuditLogEvent } from "discord.js";

import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";
import { findAuditLogExecutor } from "@/utils/logs/auditLog";

export default new Event({
  name: "inviteCreate",

  async execute(client, invite) {
    const guildId = invite.guild?.id;
    if (!guildId) return;

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const audit = await findAuditLogExecutor(
      guild,
      AuditLogEvent.InviteCreate,
      invite.code,
    );

    const container = buildLogEntry({
      category: "channels",
      title: "Invite created",
      description: `Code: \`${invite.code}\``,
      fields: [
        {
          name: "Channel",
          value: invite.channel ? invite.channel.toString() : "*unknown*",
        },
        {
          name: "Max uses",
          value: invite.maxUses ? String(invite.maxUses) : "*Unlimited*",
        },
        {
          name: "Expires",
          value: invite.expiresAt
            ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>`
            : "*Never*",
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
