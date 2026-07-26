import {
  type GuildMember,
  type PermissionResolvable,
  type GuildTextBasedChannel,
} from "discord.js";

export function checkPermissions(
  member: GuildMember,
  channel: GuildTextBasedChannel,
  permissions?: PermissionResolvable[],
) {
  if (!permissions || permissions.length === 0) return true;

  const channelPermissions = channel.permissionsFor(member);

  if (!channelPermissions) return false;

  return permissions.every((permission) => channelPermissions.has(permission));
}
