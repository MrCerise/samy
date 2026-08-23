import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";

export default new MessageCommand({
  name: "afk",
  aliases: [],
  description: "Set yourself as AFK, optionally with a reason",
  arguments: [
    {
      name: "reason",
      type: "string",
      required: false,
      description: "The reason you're going AFK",
    },
  ],
  category: "Utility",
  async execute(client, message, args) {
    const guild = message.guild;

    if (!guild) return;

    const reason =
      args.getString("reason") || client.i18n.t("commands.afk.default_reason");

    if (reason.length > 256) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(Text(client.i18n.t("commands.afk.limit"))),
        ],
      });
      return;
    }

    client.afkUsers.set(`${guild.id}:${message.author.id}`, {
      guildId: guild.id,
      userId: message.author.id,
      reason,
      createdAt: new Date(),
    });

    await client.prisma.afk.upsert({
      where: {
        userId_guildId: {
          userId: message.author.id,
          guildId: guild.id,
        },
      },
      create: {
        userId: message.author.id,
        guildId: guild.id,
        reason,
      },
      update: {
        reason,
        createdAt: new Date(),
      },
    });

    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        parse: [],
      },
      components: [
        new Container().text(
          Text(
            client.i18n.t("commands.afk.set", {
              reason,
            }),
          ),
        ),
      ],
    });
  },
});
