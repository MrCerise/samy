import type { Message } from "discord.js";
import type Client from "../classes/client";

export type BuiltInArgumentTypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "user"
  | "member"
  | "role"
  | "channel";

export type ArgumentTypeName = BuiltInArgumentTypeName | (string & {});

export interface ArgumentResolverContext {
  client: Client;
  message: Message;
  raw: string;
}

export type ArgumentResolveResult<T = unknown> =
  | { success: true; value: T }
  | { success: false; error: string };

export interface ArgumentTypeDefinition<T = unknown> {
  name: ArgumentTypeName;
  description?: string;
  resolve: (
    raw: string,
    context: ArgumentResolverContext,
  ) => Promise<ArgumentResolveResult<T>> | ArgumentResolveResult<T>;
}
