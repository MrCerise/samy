import type { Message } from "discord.js";
import type Client from "../client";
import {
  ArgumentParser,
  type ArgumentParseResult,
} from "../../utils/parser/ArgumentParser";
import { buildHelp, buildUsage } from "../../utils/parser/HelpGenerator";
import type { ParsedArguments } from "../../utils/parser/ParsedArguments";
import type { MessageArgument } from "../../types/MessageArgument";
import type { BaseCommandOptions } from "./Shared";

export interface MessageSubcommandOptions extends BaseCommandOptions {
  name: string;
  description?: string;

  arguments?: MessageArgument[];
  subcommands?: MessageSubcommand[];

  execute?: (
    client: Client,
    message: Message,
    args: ParsedArguments,
  ) => Promise<void>;
}

export interface MessageCommandOptions extends BaseCommandOptions {
  name: string;
  aliases?: string[];
  description?: string;

  arguments?: MessageArgument[];
  subcommands?: MessageSubcommand[];

  execute?: (
    client: Client,
    message: Message,
    args: ParsedArguments,
  ) => Promise<void>;
}

export class MessageSubcommand {
  constructor(public readonly options: MessageSubcommandOptions) {}

  get name() {
    return this.options.name;
  }

  get description() {
    return this.options.description;
  }

  get arguments() {
    return this.options.arguments ?? [];
  }

  get cooldown() {
    return this.options.cooldown;
  }

  get guildOnly() {
    return this.options.guildOnly;
  }

  get ownerOnly() {
    return this.options.ownerOnly;
  }

  get userPermissions() {
    return this.options.userPermissions;
  }

  get botPermissions() {
    return this.options.botPermissions;
  }

  get subcommands() {
    return this.options.subcommands ?? [];
  }

  find(name: string) {
    return this.subcommands.find((sub) => sub.name === name);
  }

  parse(
    client: Client,
    message: Message,
    input: string,
  ): Promise<ArgumentParseResult> {
    return ArgumentParser.parse(client, message, input, this.arguments);
  }

  usage(prefix: string): string {
    return buildUsage({ prefix, name: this.name }, this.arguments);
  }

  help(prefix: string): string {
    return buildHelp({ prefix, name: this.name }, this.arguments);
  }

  execute(client: Client, message: Message, args: ParsedArguments) {
    return this.options.execute?.(client, message, args);
  }
}

export class MessageCommand {
  constructor(public readonly options: MessageCommandOptions) {}

  get name() {
    return this.options.name;
  }

  get aliases() {
    return this.options.aliases ?? [];
  }

  get description() {
    return this.options.description;
  }

  get arguments() {
    return this.options.arguments ?? [];
  }

  get cooldown() {
    return this.options.cooldown;
  }

  get guildOnly() {
    return this.options.guildOnly;
  }

  get ownerOnly() {
    return this.options.ownerOnly;
  }

  get userPermissions() {
    return this.options.userPermissions;
  }

  get botPermissions() {
    return this.options.botPermissions;
  }

  get subcommands() {
    return this.options.subcommands ?? [];
  }

  find(name: string) {
    return this.subcommands.find((sub) => sub.name === name);
  }

  parse(
    client: Client,
    message: Message,
    input: string,
  ): Promise<ArgumentParseResult> {
    return ArgumentParser.parse(client, message, input, this.arguments);
  }

  usage(prefix: string): string {
    return buildUsage({ prefix, name: this.name }, this.arguments);
  }

  help(prefix: string): string {
    return buildHelp({ prefix, name: this.name }, this.arguments);
  }

  execute(client: Client, message: Message, args: ParsedArguments) {
    return this.options.execute?.(client, message, args);
  }
}
