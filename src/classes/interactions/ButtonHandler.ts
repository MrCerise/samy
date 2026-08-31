import type { ButtonInteraction } from "discord.js";
import type Client from "../client";
import type { BaseInteractionOptions } from "./Shared";

export interface ButtonHandlerOptions extends BaseInteractionOptions {
  namespace: string;
  action: string;
  invokerOnly?: boolean;

  execute: (
    client: Client,
    interaction: ButtonInteraction,
    params: string[],
    invokerId: string,
  ) => Promise<void>;
}

export class ButtonHandler {
  constructor(public readonly options: ButtonHandlerOptions) {}

  get name() {
    return `${this.options.namespace}:${this.options.action}`;
  }

  get namespace() {
    return this.options.namespace;
  }

  get action() {
    return this.options.action;
  }

  get invokerOnly() {
    return this.options.invokerOnly ?? true;
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
    interaction: ButtonInteraction,
    params: string[],
    invokerId: string,
  ) {
    return this.options.execute(client, interaction, params, invokerId);
  }
}
