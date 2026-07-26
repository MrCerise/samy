import type { Channel, GuildMember, Role, User } from "discord.js";
import type {
  ArgumentResolveResult,
  ArgumentResolverContext,
  ArgumentTypeDefinition,
  ArgumentTypeName,
} from "../../types/ArgumentType";

const USER_MENTION = /^<@!?(\d{15,20})>$/;
const ROLE_MENTION = /^<@&(\d{15,20})>$/;
const CHANNEL_MENTION = /^<#(\d{15,20})>$/;
const SNOWFLAKE = /^\d{15,20}$/;

function ok<T>(value: T): ArgumentResolveResult<T> {
  return { success: true, value };
}

function fail<T = never>(error: string): ArgumentResolveResult<T> {
  return { success: false, error };
}

class ArgumentRegistryClass {
  private readonly types = new Map<string, ArgumentTypeDefinition<unknown>>();

  register<T>(definition: ArgumentTypeDefinition<T>): void {
    this.types.set(
      definition.name.toLowerCase(),
      definition as ArgumentTypeDefinition<unknown>,
    );
  }

  get(name: ArgumentTypeName): ArgumentTypeDefinition<unknown> | undefined {
    return this.types.get(name.toLowerCase());
  }

  has(name: ArgumentTypeName): boolean {
    return this.types.has(name.toLowerCase());
  }
}

export const ArgumentRegistry = new ArgumentRegistryClass();

export function registerArgumentType<T>(
  definition: ArgumentTypeDefinition<T>,
): void {
  ArgumentRegistry.register(definition);
}

ArgumentRegistry.register<string>({
  name: "string",
  description: "Any text value.",
  resolve: (raw) => ok(raw),
});

ArgumentRegistry.register<number>({
  name: "number",
  description: "Any numeric value, including decimals.",
  resolve: (raw) => {
    const value = Number(raw);
    return Number.isNaN(value)
      ? fail(`"${raw}" is not a valid number`)
      : ok(value);
  },
});

ArgumentRegistry.register<number>({
  name: "integer",
  description: "A whole number.",
  resolve: (raw) => {
    const value = Number(raw);
    if (Number.isNaN(value) || !Number.isInteger(value)) {
      return fail(`"${raw}" is not a valid integer`);
    }
    return ok(value);
  },
});

ArgumentRegistry.register<boolean>({
  name: "boolean",
  description: "true or false.",
  resolve: (raw) => {
    const normalized = raw.toLowerCase();
    if (normalized === "true") return ok(true);
    if (normalized === "false") return ok(false);
    return fail(`"${raw}" is not a valid boolean (expected true or false)`);
  },
});

ArgumentRegistry.register<User>({
  name: "user",
  description: "A Discord user (mention, ID, or unique username).",
  resolve: async (
    raw,
    context: ArgumentResolverContext,
  ): Promise<ArgumentResolveResult<User>> => {
    const { client, message } = context;

    const mentionMatch = raw.match(USER_MENTION);
    const id = mentionMatch?.[1] ?? (SNOWFLAKE.test(raw) ? raw : undefined);

    if (id) {
      try {
        const user = await client.users.fetch(id);
        return ok(user);
      } catch {
        return fail(`No user found with ID "${id}"`);
      }
    }

    const cleaned = raw.replace(/^@/, "").toLowerCase();

    if (message.guild) {
      const members = await message.guild.members
        .fetch()
        .catch(() => message.guild!.members.cache);

      const matches = members.filter(
        (member) => member.user.username.toLowerCase() === cleaned,
      );

      if (matches.size === 1) return ok(matches.first()!.user);
      if (matches.size > 1)
        return fail(
          `Multiple users match "${raw}" — try a mention or ID instead`,
        );
    }

    const cached = client.users.cache.find(
      (user) => user.username.toLowerCase() === cleaned,
    );
    if (cached) return ok(cached);

    return fail(`No user found matching "${raw}"`);
  },
});

ArgumentRegistry.register<GuildMember>({
  name: "member",
  description: "A guild member (mention, ID, display name, or username).",
  resolve: async (
    raw,
    context: ArgumentResolverContext,
  ): Promise<ArgumentResolveResult<GuildMember>> => {
    const { message } = context;

    if (!message.guild) {
      return fail("This argument can only be used in a server");
    }

    const mentionMatch = raw.match(USER_MENTION);
    const id = mentionMatch?.[1] ?? (SNOWFLAKE.test(raw) ? raw : undefined);

    if (id) {
      try {
        const member = await message.guild.members.fetch(id);
        return ok(member);
      } catch {
        return fail(`No member found with ID "${id}"`);
      }
    }

    const cleaned = raw.replace(/^@/, "").toLowerCase();
    const members = await message.guild.members
      .fetch()
      .catch(() => message.guild!.members.cache);

    const byDisplayName = members.find(
      (member) => member.displayName.toLowerCase() === cleaned,
    );
    if (byDisplayName) return ok(byDisplayName);

    const byUsername = members.find(
      (member) => member.user.username.toLowerCase() === cleaned,
    );
    if (byUsername) return ok(byUsername);

    return fail(`No member found matching "${raw}"`);
  },
});

ArgumentRegistry.register<Role>({
  name: "role",
  description: "A guild role (mention, ID, or exact name).",
  resolve: async (
    raw,
    context: ArgumentResolverContext,
  ): Promise<ArgumentResolveResult<Role>> => {
    const { message } = context;

    if (!message.guild) {
      return fail("This argument can only be used in a server");
    }

    const mentionMatch = raw.match(ROLE_MENTION);
    const id = mentionMatch?.[1] ?? (SNOWFLAKE.test(raw) ? raw : undefined);

    if (id) {
      const role = await message.guild.roles.fetch(id).catch(() => null);
      return role ? ok(role) : fail(`No role found with ID "${id}"`);
    }

    const cleaned = raw.toLowerCase();
    const role = message.guild.roles.cache.find(
      (r) => r.name.toLowerCase() === cleaned,
    );

    return role ? ok(role) : fail(`No role found matching "${raw}"`);
  },
});

ArgumentRegistry.register<Channel>({
  name: "channel",
  description: "A guild channel (mention, ID, or name).",
  resolve: async (
    raw,
    context: ArgumentResolverContext,
  ): Promise<ArgumentResolveResult<Channel>> => {
    const { message } = context;

    if (!message.guild) {
      return fail("This argument can only be used in a server");
    }

    const mentionMatch = raw.match(CHANNEL_MENTION);
    const id = mentionMatch?.[1] ?? (SNOWFLAKE.test(raw) ? raw : undefined);

    if (id) {
      const channel = await message.guild.channels.fetch(id).catch(() => null);
      return channel ? ok(channel) : fail(`No channel found with ID "${id}"`);
    }

    const cleaned = raw.replace(/^#/, "").toLowerCase();
    const channel = message.guild.channels.cache.find(
      (c) => c.name.toLowerCase() === cleaned,
    );

    return channel ? ok(channel) : fail(`No channel found matching "${raw}"`);
  },
});
