import type {
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
} from "discord.js";
import type Client from "../client";
import type { BaseCommandOptions } from "./Shared";

export interface ContextCommandOptions extends BaseCommandOptions {
  data: ContextMenuCommandBuilder;

  execute: (
    client: Client,
    interaction: ContextMenuCommandInteraction,
  ) => Promise<void>;
}

export class ContextCommand {
  constructor(public readonly options: ContextCommandOptions) {}

  get name() {
    return this.options.data.name;
  }

  get cooldown() {
    return this.options.cooldown;
  }

  execute(client: Client, interaction: ContextMenuCommandInteraction) {
    return this.options.execute(client, interaction);
  }
}
