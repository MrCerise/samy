import type {
  ChatInputCommandInteraction,
  SharedSlashCommand,
} from "discord.js";
import type Client from "../client";
import type { BaseCommandOptions } from "./Shared";

export interface SlashCommandOptions extends BaseCommandOptions {
  data: SharedSlashCommand;

  execute: (
    client: Client,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void>;
}

export class SlashCommand {
  constructor(public readonly options: SlashCommandOptions) {}

  get name() {
    return this.options.data.name;
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

  execute(client: Client, interaction: ChatInputCommandInteraction) {
    return this.options.execute(client, interaction);
  }
}
