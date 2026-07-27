import type { Guild, User } from "discord.js";

export function replaceVariables(
  content: string,
  options: {
    user: User;
    guild: Guild;
  },
): string {
  const { user, guild } = options;

  const variables: Record<string, string> = {
    "{user}": user.toString(),
    "{user.id}": user.id,
    "{user.name}": user.username,
    "{user.avatar}": user.displayAvatarURL({
      size: 1024,
    }),

    "{guild.name}": guild.name,
    "{guild.id}": guild.id,
    "{guild.icon}":
      guild.iconURL({
        size: 1024,
      }) ?? "",

    "{memberCount}": guild.memberCount.toString(),
  };

  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(key, value);
  }

  return result;
}
