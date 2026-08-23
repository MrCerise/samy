import type { PermissionResolvable } from "discord.js";

export interface BaseInteractionOptions {
  cooldown?: number;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
}
