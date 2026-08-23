import type { StringSelectMenuInteraction } from "discord.js";
import type Client from "../client";
import type { BaseInteractionOptions } from "./Shared";

export interface SelectHandlerOptions extends BaseInteractionOptions {
  namespace: string;
  action: string;

  execute: (
    client: Client,
    interaction: StringSelectMenuInteraction,
    params: string[],
    invokerId: string,
    value: string,
  ) => Promise<void>;
}

export class SelectHandler {
  constructor(public readonly options: SelectHandlerOptions) {}

  get name() {
    return `${this.options.namespace}:${this.options.action}`;
  }

  get namespace() {
    return this.options.namespace;
  }

  get action() {
    return this.options.action;
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

  execute(
    client: Client,
    interaction: StringSelectMenuInteraction,
    params: string[],
    invokerId: string,
    value: string,
  ) {
    return this.options.execute(
      client,
      interaction,
      params,
      invokerId,
      value,
    );
  }
}
