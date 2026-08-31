import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
} from "discord.js";
import type Client from "@/classes/client";
import type {
  ContextCommand,
  MessageCommand,
  MessageSubcommand,
  SlashCommand,
} from "@/classes/Command";

type Command =
  SlashCommand | MessageCommand | MessageSubcommand | ContextCommand;
export type CommandType = "slash" | "message" | "context";

function getCooldownKey(
  commandType: CommandType,
  userId: string,
  command: Command,
  options?: {
    interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    path?: string[];
  },
) {
  const parts = [commandType, userId, command.name];

  if (commandType === "slash" && options?.interaction) {
    const interaction = options.interaction as ChatInputCommandInteraction;
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(false);

    if (group) parts.push(group);
    if (sub) parts.push(sub);
  }

  if (commandType === "message" && options?.path) {
    parts.push(...options.path);
  }

  return parts.join(":");
}

export function checkCooldown(
  client: Client,
  commandType: CommandType,
  userId: string,
  command: Command,
  options?: {
    interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    path?: string[];
  },
) {
  const key = getCooldownKey(commandType, userId, command, options);

  const expiresAt = client.cooldowns.get(key);

  if (!expiresAt) return null;

  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    client.cooldowns.delete(key);
    return null;
  }

  return Math.ceil(remaining / 1000);
}

export function setCooldown(
  client: Client,
  commandType: CommandType,
  userId: string,
  command: Command,
  cooldown: number,
  options?: {
    interaction?: ChatInputCommandInteraction | ContextMenuCommandInteraction;
    path?: string[];
  },
) {
  const key = getCooldownKey(commandType, userId, command, options);

  client.cooldowns.set(key, Date.now() + cooldown * 1000);
}
