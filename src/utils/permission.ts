import {
  type GuildMember,
  type PermissionResolvable,
  type GuildTextBasedChannel,
} from "discord.js";

import { hasFakePermission } from "@/utils/settings";

export async function getMissingPermissions(
  member: GuildMember,
  channel: GuildTextBasedChannel,
  permissions?: PermissionResolvable[],
): Promise<PermissionResolvable[]> {
  if (!permissions || permissions.length === 0) {
    return [];
  }

  const channelPermissions = channel.permissionsFor(member);

  if (!channelPermissions) {
    return permissions;
  }

  const missing = permissions.filter(
    (permission) => !channelPermissions.has(permission),
  );

  if (missing.length === 0) {
    return [];
  }

  const memberRoles = member.roles.cache.map((role) => role.id);

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

  return missing.filter((_, index) => !fakeChecks[index]);
}

export async function checkPermissions(
  member: GuildMember,
  channel: GuildTextBasedChannel,
  permissions?: PermissionResolvable[],
) {
  const missing = await getMissingPermissions(member, channel, permissions);

  return missing.length === 0;
}
