import {
  type GuildMember,
  type PermissionResolvable,
  type GuildTextBasedChannel,
} from "discord.js";
import { hasFakePermission } from "@/utils/settings";

export async function checkPermissions(
  member: GuildMember,
  channel: GuildTextBasedChannel,
  permissions?: PermissionResolvable[],
) {
  if (!permissions || permissions.length === 0) return true;

  const channelPermissions = channel.permissionsFor(member);

  if (!channelPermissions) return false;

  const hasReal = permissions.every((permission) =>
    channelPermissions.has(permission),
  );

  if (hasReal) return true;

  const missing = permissions.filter(
    (permission) => !channelPermissions.has(permission),
  );

  const memberRoles = member.roles.cache.map((r) => r.id);

  const fakeChecks = await Promise.all(
    missing.map((permission) =>
      hasFakePermission(
        member.guild.id,
        member.id,
        permission as string,
        memberRoles,
      ),
    ),
  );

  return fakeChecks.every((result) => result);
}
