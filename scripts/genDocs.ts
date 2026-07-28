import { Collection } from "discord.js";
import { mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";

import Client from "../src/classes/client";
import { LoadCommands } from "../src/classes/commands/LoadCommands";
import type {
  MessageCommand,
  MessageSubcommand,
} from "../src/classes/commands/MessageCommand";
import type { SlashCommand } from "../src/classes/commands/SlashCommand";

const OUTPUT_DIR = join(import.meta.dir, "../docs/commands");

interface ArgDoc {
  name: string;
  description?: string;
  required?: boolean;
  type?: string;
}

interface CommandDoc {
  name: string;
  type: "message" | "slash";
  description?: string;
  category: string;
  aliases?: string[];
  cooldown?: number;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  userPermissions?: string[];
  botPermissions?: string[];
  usage?: string;
  arguments: ArgDoc[];
  subcommands: CommandDoc[];
}

function docMessageSubcommand(
  sub: MessageSubcommand,
  prefix: string,
  parentName: string,
): CommandDoc {
  return {
    name: `${parentName} ${sub.name}`,
    type: "message",
    description: sub.description,
    category: "—",
    aliases: sub.aliases,
    cooldown: sub.cooldown,
    guildOnly: sub.guildOnly,
    ownerOnly: sub.ownerOnly,
    userPermissions: sub.userPermissions?.map(String),
    botPermissions: sub.botPermissions?.map(String),
    usage: sub.usage(prefix),
    arguments: sub.arguments.map((a) => ({
      name: a.name,
      description: a.description,
      type: a.type,
    })),
    subcommands: [],
  };
}

function docMessageCommand(cmd: MessageCommand, prefix: string): CommandDoc {
  return {
    name: cmd.name,
    type: "message",
    description: cmd.description,
    category: cmd.options.category ?? "Uncategorized",
    aliases: cmd.aliases,
    cooldown: cmd.cooldown,
    guildOnly: cmd.guildOnly,
    ownerOnly: cmd.ownerOnly,
    userPermissions: cmd.userPermissions?.map(String),
    botPermissions: cmd.botPermissions?.map(String),
    usage: cmd.usage(prefix),
    arguments: cmd.arguments.map((a) => ({
      name: a.name,
      description: a.description,
      type: a.type,
    })),
    subcommands: cmd.subcommands.map((sub) =>
      docMessageSubcommand(sub, prefix, cmd.name),
    ),
  };
}

function docSlashCommand(cmd: SlashCommand): CommandDoc {
  const json = cmd.options.data.toJSON();

  const SUB_COMMAND = 1;
  const SUB_COMMAND_GROUP = 2;

  return {
    name: json.name,
    type: "slash",
    description: json.description,
    category: cmd.options.category ?? "Uncategorized",
    cooldown: cmd.cooldown,
    guildOnly: cmd.guildOnly,
    ownerOnly: cmd.ownerOnly,
    userPermissions: cmd.userPermissions?.map(String),
    botPermissions: cmd.botPermissions?.map(String),
    arguments: (json.options ?? [])
      .filter((o) => o.type !== SUB_COMMAND && o.type !== SUB_COMMAND_GROUP)
      .map((o) => ({
        name: o.name,
        description: o.description,
        required: "required" in o ? o.required : undefined,
      })),
    subcommands: (json.options ?? [])
      .filter((o) => o.type === SUB_COMMAND)
      .map((sub) => ({
        name: `${json.name} ${sub.name}`,
        type: "slash" as const,
        description: sub.description,
        category: "—",
        arguments: (("options" in sub ? sub.options : []) ?? []).map((o) => ({
          name: o.name,
          description: o.description,
          required: "required" in o ? o.required : undefined,
        })),
        subcommands: [],
      })),
  };
}

function badge(label: string): string {
  return `\`${label}\``;
}

function renderMeta(doc: CommandDoc): string {
  const badges: string[] = [];

  if (doc.type === "slash") badges.push(badge("slash"));
  if (doc.type === "message") badges.push(badge("prefix"));
  if (doc.guildOnly) badges.push(badge("guild only"));
  if (doc.ownerOnly) badges.push(badge("owner only"));
  if (doc.cooldown) badges.push(badge(`${doc.cooldown}s cooldown`));

  let out = badges.length ? badges.join(" ") + "\n\n" : "";

  if (doc.aliases?.length) {
    out += `**Aliases:** ${doc.aliases.map((a) => `\`${a}\``).join(", ")}\n\n`;
  }

  if (doc.userPermissions?.length) {
    out += `**Requires:** ${doc.userPermissions.join(", ")}\n\n`;
  }

  return out;
}

function renderArgs(args: ArgDoc[]): string {
  if (!args.length) return "";

  const rows = args
    .map(
      (a) =>
        `| \`${a.name}\` | ${a.description ?? "—"} | ${a.required ? "true" : "false"} |`,
    )
    .join("\n");

  return `| Argument | Description | Required |\n| :-- | :-- | :--: |\n${rows}\n\n`;
}

function renderCommand(doc: CommandDoc, headingLevel = 1): string {
  const heading = "#".repeat(headingLevel);
  const label = doc.type === "slash" ? `/${doc.name}` : doc.name;

  let out = `${heading} \`${label}\`\n\n`;
  out += renderMeta(doc);
  out += `${doc.description ?? "*No description provided.*"}\n\n`;

  if (doc.usage) {
    out += `**Usage**\n\`\`\`\n${doc.usage}\n\`\`\`\n\n`;
  }

  out += renderArgs(doc.arguments);

  if (doc.subcommands.length) {
    for (const sub of doc.subcommands) {
      out += renderCommand(sub, headingLevel + 1);
    }
  }

  return out;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const client = new Client();

  const messageCommands = new Collection<string, MessageCommand>();
  const slashCommands = new Collection<string, SlashCommand>();

  await LoadCommands(client, "../../commands/message", messageCommands);
  await LoadCommands(client, "../../commands/slash", slashCommands);

  const prefix = client.prefix ?? ",";

  const docs: CommandDoc[] = [
    ...messageCommands.map((c) => docMessageCommand(c, prefix)),
    ...slashCommands.map(docSlashCommand),
  ];

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const typeIndexRows: string[] = [];

  const byType: Record<"message" | "slash", CommandDoc[]> = {
    message: docs.filter((d) => d.type === "message"),
    slash: docs.filter((d) => d.type === "slash"),
  };

  for (const type of ["message", "slash"] as const) {
    const typeCommands = byType[type];
    if (!typeCommands.length) continue;

    const typeDir = join(OUTPUT_DIR, type);
    await mkdir(typeDir, { recursive: true });

    const byCategory = Object.groupBy(typeCommands, (d) => d.category);
    const categoryIndexRows: string[] = [];

    for (const [category, commands] of Object.entries(byCategory)) {
      if (!commands?.length) continue;

      const categorySlug = toSlug(category);
      const categoryDir = join(typeDir, categorySlug);

      await mkdir(categoryDir, { recursive: true });

      const sorted = [...commands].sort((a, b) => a.name.localeCompare(b.name));
      const commandRows: string[] = [];

      for (const doc of sorted) {
        const commandSlug = toSlug(doc.name);
        const label = doc.type === "slash" ? `/${doc.name}` : doc.name;

        await writeFile(
          join(categoryDir, `${commandSlug}.md`),
          renderCommand(doc),
        );

        commandRows.push(
          `| [\`${label}\`](./${commandSlug}.md) | ${doc.description ?? "—"} |`,
        );
      }

      const categoryReadme =
        `# ${category}\n\n` +
        `> ${sorted.length} command${sorted.length === 1 ? "" : "s"}\n\n` +
        `| Command | Description |\n| :-- | :-- |\n${commandRows.join("\n")}\n`;

      await writeFile(join(categoryDir, "README.md"), categoryReadme);

      categoryIndexRows.push(
        `| [${category}](./${categorySlug}) | ${sorted.length} |`,
      );
    }

    const typeReadme =
      `# ${type === "slash" ? "Slash" : "Message"} Commands\n\n` +
      `${typeCommands.length} commands across ${categoryIndexRows.length} categories.\n\n` +
      `| Category | Commands |\n| :-- | :--: |\n${categoryIndexRows.join("\n")}\n`;

    await writeFile(join(typeDir, "README.md"), typeReadme);

    typeIndexRows.push(
      `| [${type === "slash" ? "Slash" : "Message"}](./${type}) | ${typeCommands.length} |`,
    );
  }

  const totalCommands = docs.length;

  const readme =
    `# Commands\n\n` +
    `${totalCommands} commands total.\n\n` +
    `| Type | Commands |\n| :-- | :--: |\n${typeIndexRows.join("\n")}\n\n` +
    `<sub>Generated ${generatedAt} — do not edit by hand, run \`bun run docs\` instead.</sub>\n`;

  await writeFile(join(OUTPUT_DIR, "README.md"), readme);

  console.log(`Generated docs for ${totalCommands} commands.`);
}

main().catch((err) => {
  console.error("Doc generation failed:", err);
  process.exit(1);
});
