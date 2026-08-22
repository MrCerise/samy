import type Client from "@/classes/client";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

const INVITE_PATTERN =
  /(?:discord\.gg\/|discord(?:app)?\.com\/invite\/)?([\w-]{2,32})$/i;

export async function InviteInfo(client: Client, raw: string) {
  const match = raw.trim().match(INVITE_PATTERN);
  const code = match?.[1];

  if (!code) {
    return errorUI(client.i18n.t("commands.inviteinfo.invalid"));
  }

  const invite = await client.fetchInvite(code).catch(() => null);

  if (!invite) {
    return errorUI(client.i18n.t("commands.inviteinfo.not_found"));
  }

  const lines = [
    `**${client.i18n.t("commands.inviteinfo.title", { code: invite.code })}**`,
    client.i18n.t("commands.inviteinfo.details", {
      guild: invite.guild?.name ?? client.i18n.t("commands.inviteinfo.unknown"),
      channel:
        invite.channel?.name ?? client.i18n.t("commands.inviteinfo.unknown"),
      inviter: invite.inviter
        ? `${invite.inviter.username}`
        : client.i18n.t("commands.inviteinfo.unknown"),
      uses: invite.uses?.toLocaleString() ?? "0",
      maxUses: invite.maxUses ? invite.maxUses.toLocaleString() : "∞",
      expires: invite.expiresTimestamp
        ? `<t:${Math.floor(invite.expiresTimestamp / 1000)}:R>`
        : client.i18n.t("commands.inviteinfo.never"),
      memberCount: invite.memberCount?.toLocaleString() ?? "N/A",
      presenceCount: invite.presenceCount?.toLocaleString() ?? "N/A",
    }),
  ];

  return new Container().text(Text(lines.join("\n")));
}
