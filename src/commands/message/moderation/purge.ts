import { MessageFlags, type Message } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;

async function executePurge({
  message,
  filterFn,
  amount,
}: {
  message: Message;
  filterFn?: (msg: Message) => boolean;
  amount: number;
}): Promise<void> {
  const targetAmount = Math.min(Math.max(amount, 1), 100);

  if (!message.channel.isTextBased() || !("bulkDelete" in message.channel)) {
    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text("Messages can only be purged in text channels."),
        ),
      ],
    });
    return;
  }

  await message.delete().catch(() => {});

  const fetched = await message.channel.messages.fetch({ limit: 10 });
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  const validMessages = fetched.filter(
    (msg) =>
      msg.createdTimestamp > fourteenDaysAgo &&
      msg.id !== message.id &&
      (!filterFn || filterFn(msg)),
  );

  const toDelete = Array.from(validMessages.values()).slice(0, targetAmount);

  if (toDelete.length === 0) {
    const response = await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text(
            "No recent messages (under 14 days old) were found matching the criteria.",
          ),
        ),
      ],
    });

    setTimeout(() => response.delete().catch(() => {}), 4000);
    return;
  }

  const deleted = await message.channel.bulkDelete(toDelete, true);

  const response = await message.channel.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      new Container().text(
        Text(
          `Successfully deleted ${deleted.size} message${deleted.size === 1 ? "" : "s"}.`,
        ),
      ),
    ],
  });

  setTimeout(() => response.delete().catch(() => {}), 4000);
}

export default new MessageCommand({
  name: "purge",
  description: "Purge messages from the current channel.",
  aliases: ["clear", "c", "clean", "prune"],
  category: "Moderation",
  guildOnly: true,
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],

  arguments: [
    {
      name: "amount",
      aliases: ["a", "count"],
      type: "integer",
      description: "Number of messages to delete (1-100).",
      required: false,
      default: 10,
    },
  ],

  async execute(client, message, args) {
    const amount = args.getInteger("amount") ?? 10;
    await executePurge({ message, amount });
  },

  subcommands: [
    new MessageSubcommand({
      name: "user",
      description: "Delete messages sent by a specific user.",
      aliases: ["member", "author"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "user",
          aliases: ["u", "m", "member"],
          type: "user",
          description: "The user whose messages to delete.",
          required: true,
        },
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description: "Number of messages to delete (1-100, default: 10).",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        const targetUser = args.getUser("user")!;
        const amount = args.getInteger("amount") ?? 10;
        await executePurge({
          message,
          amount,
          filterFn: (msg) => msg.author.id === targetUser.id,
        });
      },
    }),

    new MessageSubcommand({
      name: "links",
      description: "Delete messages containing links/URLs.",
      aliases: ["link", "urls", "url"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description:
            "Number of link messages to delete (1-100, default: 10).",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        const amount = args.getInteger("amount") ?? 10;
        await executePurge({
          message,
          amount,
          filterFn: (msg) => URL_REGEX.test(msg.content),
        });
      },
    }),

    new MessageSubcommand({
      name: "bots",
      description: "Delete messages sent by bots.",
      aliases: ["bot"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description: "Number of bot messages to delete (1-100, default: 10).",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        const amount = args.getInteger("amount") ?? 10;
        await executePurge({
          message,
          amount,
          filterFn: (msg) => msg.author.bot,
        });
      },
    }),

    new MessageSubcommand({
      name: "attachments",
      description: "Delete messages containing attachments/files.",
      aliases: ["attachment", "files", "file"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description:
            "Number of attachment messages to delete (1-100, default: 10).",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        const amount = args.getInteger("amount") ?? 10;
        await executePurge({
          message,
          amount,
          filterFn: (msg) => msg.attachments.size > 0,
        });
      },
    }),

    new MessageSubcommand({
      name: "embeds",
      description: "Delete messages containing embeds.",
      aliases: ["embed"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description:
            "Number of embed messages to delete (1-100, default: 10).",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        const amount = args.getInteger("amount") ?? 10;
        await executePurge({
          message,
          amount,
          filterFn: (msg) => msg.embeds.length > 0,
        });
      },
    }),
  ],
});
