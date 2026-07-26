import type { PermissionResolvable } from "discord.js";

export interface BaseCommandOptions {
  category?: string;
  cooldown?: number;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
}
