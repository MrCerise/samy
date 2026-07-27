import { MessageFlags, type Message } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";
import type Client from "@/classes/client";

const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;

async function executePurge({
  message,
  client,
  filterFn,
  amount,
}: {
  message: Message;
  client: Client;
  filterFn?: (msg: Message) => boolean;
  amount: number;
}): Promise<void> {
  const targetAmount = Math.min(Math.max(amount, 1), 100);

  if (!message.channel.isTextBased() || !("bulkDelete" in message.channel)) {
    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text(client.i18n.t("commands.purge.text_channel_only")),
        ),
      ],
    });

    return;
  }

  await message.delete().catch(() => {});

  const fetched = await message.channel.messages.fetch({ limit: 10 });
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  const messages = fetched.filter(
    (msg) =>
      msg.createdTimestamp > fourteenDaysAgo &&
      msg.id !== message.id &&
      (!filterFn || filterFn(msg)),
  );

  const toDelete = Array.from(messages.values()).slice(0, targetAmount);

  if (toDelete.length === 0) {
    const response = await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(Text(client.i18n.t("commands.purge.none"))),
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
          client.i18n.t("commands.purge.deleted", {
            count: deleted.size,
            noun: deleted.size === 1 ? "message" : "messages",
          }),
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
    await executePurge({
      client,
      message,
      amount: args.getInteger("amount") ?? 10,
    });
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
          description: "Number of messages to delete.",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        await executePurge({
          client,
          message,
          amount: args.getInteger("amount") ?? 10,
          filterFn: (msg) => msg.author.id === args.getUser("user")?.id,
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
          description: "Number of messages to delete.",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        await executePurge({
          client,
          message,
          amount: args.getInteger("amount") ?? 10,
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
          description: "Number of messages to delete.",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        await executePurge({
          client,
          message,
          amount: args.getInteger("amount") ?? 10,
          filterFn: (msg) => msg.author.bot,
        });
      },
    }),

    new MessageSubcommand({
      name: "attachments",
      description: "Delete messages containing attachments.",
      aliases: ["attachment", "files", "file"],
      userPermissions: ["ManageMessages"],
      botPermissions: ["ManageMessages", "ReadMessageHistory"],

      arguments: [
        {
          name: "amount",
          aliases: ["a", "count"],
          type: "integer",
          description: "Number of messages to delete.",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        await executePurge({
          client,
          message,
          amount: args.getInteger("amount") ?? 10,
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
          description: "Number of messages to delete.",
          required: false,
          default: 10,
        },
      ],

      async execute(client, message, args) {
        await executePurge({
          client,
          message,
          amount: args.getInteger("amount") ?? 10,
          filterFn: (msg) => msg.embeds.length > 0,
        });
      },
    }),
  ],
});
