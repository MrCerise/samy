import { Elysia } from "elysia";
import type Client from "@/classes/client";
import type { MessageCommand, MessageSubcommand } from "@/classes/Command";

interface SerializedSubcommand {
  name: string;
  aliases: string[];
  description: string | null;

  arguments: MessageSubcommand["arguments"];

  cooldown: number | null;
  guildOnly: boolean;
  ownerOnly: boolean;

  userPermissions: MessageSubcommand["userPermissions"];
  botPermissions: MessageSubcommand["botPermissions"];

  hasExecute: boolean;

  subcommands: SerializedSubcommand[];
}

interface SerializedCommand {
  name: string;
  aliases: string[];
  description: string | null;

  category: string;

  arguments: MessageCommand["arguments"];

  cooldown: number | null;
  guildOnly: boolean;
  ownerOnly: boolean;

  userPermissions: MessageCommand["userPermissions"];
  botPermissions: MessageCommand["botPermissions"];

  hasExecute: boolean;

  subcommands: SerializedSubcommand[];
}

function serializeSubcommand(sub: MessageSubcommand): SerializedSubcommand {
  return {
    name: sub.name,
    aliases: sub.aliases,
    description: sub.description ?? null,

    arguments: sub.arguments,

    cooldown: sub.cooldown ?? null,
    guildOnly: sub.guildOnly ?? false,
    ownerOnly: sub.ownerOnly ?? false,

    userPermissions: sub.userPermissions ?? [],
    botPermissions: sub.botPermissions ?? [],

    hasExecute: sub.hasExecute,

    subcommands: sub.subcommands.map(serializeSubcommand),
  };
}

function serializeCommand(command: MessageCommand): SerializedCommand {
  return {
    name: command.name,
    aliases: command.aliases,
    description: command.description ?? null,

    category: command.options.category ?? "Uncategorized",

    arguments: command.arguments,

    cooldown: command.cooldown ?? null,
    guildOnly: command.guildOnly ?? false,
    ownerOnly: command.ownerOnly ?? false,

    userPermissions: command.userPermissions ?? [],
    botPermissions: command.botPermissions ?? [],

    hasExecute: command.hasExecute,

    subcommands: command.subcommands.map(serializeSubcommand),
  };
}

export default (client: Client) =>
  new Elysia({ prefix: "/commands" }).get("/", () => {
    const commands = [...client.messageCommands.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(serializeCommand);

    const categories = new Map<string, SerializedCommand[]>();

    for (const command of commands) {
      const list = categories.get(command.category) ?? [];

      list.push(command);
      categories.set(command.category, list);
    }

    return {
      commands,

      categories: Object.fromEntries(
        [...categories.entries()].sort(([a], [b]) => a.localeCompare(b)),
      ),
    };
  });
