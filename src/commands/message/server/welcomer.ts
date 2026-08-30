import { MessageFlags } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import {
  deliverWelcomeMessage,
  validateWelcomeMessage,
  welcomeFailureMessage,
} from "@/commands/shared/welcomer";
import { Container, Text } from "@/ui/components";

export default new MessageCommand({
  name: "welcomer",
  description: "Configure welcome messages for the server.",
  aliases: ["welcome", "wc"],
  guildOnly: true,
  userPermissions: ["ManageGuild"],
  category: "Server",

  subcommands: [
    new MessageSubcommand({
      name: "add",
      description: "Add a welcome message to a channel.",
      userPermissions: ["ManageGuild"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          description: "The channel to send the welcome message to.",
          type: "channel",
          required: true,
        },
        {
          name: "message",
          aliases: ["m"],
          description: "Plain text, an {embed} script, or a {cv2} script.",
          type: "string",
          required: true,
        },
      ],

      async execute(client, message, args) {
        const channel = args.getChannel("channel");

        if (!channel || !message.guildId) return;

        const content = args.getString("message");

        if (!content) return;

        const validation = validateWelcomeMessage(content);

        if (!validation.success) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(welcomeFailureMessage(client, validation.failure)),
              ),
            ],
          });

          return;
        }

        await client.prisma.guild.upsert({
          where: {
            id: message.guildId,
          },
          update: {},
          create: {
            id: message.guildId,
          },
        });

        await client.prisma.welcome.upsert({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
          update: {
            message: content,
          },
          create: {
            guildId: message.guildId,
            channelId: channel.id,
            message: content,
          },
        });

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                client.i18n.t("commands.welcome.added", {
                  channel: channel.toString(),
                }),
              ),
            ),
          ],
        });
      },
    }),

    new MessageSubcommand({
      name: "preview",
      description: "Preview a configured welcome message, or all of them.",
      userPermissions: ["ManageGuild"],
      aliases: ["view", "test"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          type: "channel",
          description:
            "The welcome channel to preview. Leave empty to preview all welcomes",
          required: false,
        },
      ],

      async execute(client, message, args) {
        if (!message.guildId || !message.guild) return;

        const member =
          message.guild.members.cache.get(message.author.id) ??
          (await message.guild.members.fetch(message.author.id));

        const channel = args.getChannel("channel");

        if (!channel) {
          const welcomes = await client.prisma.welcome.findMany({
            where: {
              guildId: message.guildId,
            },
          });

          if (welcomes.length === 0) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(client.i18n.t("commands.welcome.none")),
                ),
              ],
            });

            return;
          }

          const failed: string[] = [];

          for (const welcome of welcomes) {
            const target = await message.guild.channels
              .fetch(welcome.channelId)
              .catch(() => null);

            if (!target || !target.isTextBased() || !("send" in target)) {
              failed.push(`<#${welcome.channelId}>`);
              continue;
            }

            const result = await deliverWelcomeMessage(
              target,
              welcome.message,
              {
                user: message.author,
                guild: message.guild,
                member,
              },
            );

            if (!result.success) {
              failed.push(`<#${welcome.channelId}>`);
            }
          }

          if (failed.length > 0) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("commands.welcome.preview_all_partial", {
                      channels: failed.join(", "),
                    }),
                  ),
                ),
              ],
            });

            return;
          }

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(
                  client.i18n.t("commands.welcome.preview_all_done", {
                    count: welcomes.length,
                  }),
                ),
              ),
            ],
          });

          return;
        }

        if (!channel.isTextBased() || !("send" in channel)) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(client.i18n.t("commands.welcome.channel_unavailable")),
              ),
            ],
          });

          return;
        }

        const welcome = await client.prisma.welcome.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
        });

        if (!welcome) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(
                  client.i18n.t("commands.welcome.not_configured", {
                    channel: channel.toString(),
                  }),
                ),
              ),
            ],
          });

          return;
        }

        const result = await deliverWelcomeMessage(channel, welcome.message, {
          user: message.author,
          guild: message.guild,
          member,
        });

        if (!result.success) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(welcomeFailureMessage(client, result.failure)),
              ),
            ],
          });
        }
      },
    }),

    new MessageSubcommand({
      name: "list",
      description: "List all configured welcome messages.",
      userPermissions: ["ManageGuild"],

      async execute(client, message) {
        if (!message.guildId) return;

        const welcomes = await client.prisma.welcome.findMany({
          where: {
            guildId: message.guildId,
          },
        });

        const container = new Container();

        if (welcomes.length === 0) {
          container.text(Text(client.i18n.t("commands.welcome.none")));
        } else {
          container.text(
            Text(
              client.i18n.t("commands.welcome.configured", {
                count: welcomes.length,
                noun: welcomes.length === 1 ? "channel" : "channels",
                channels: welcomes
                  .map((welcome) => `- <#${welcome.channelId}>`)
                  .join("\n"),
              }),
            ),
          );
        }

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [container],
        });
      },
    }),

    new MessageSubcommand({
      name: "remove",
      description: "Remove a welcome message from a channel.",
      userPermissions: ["ManageGuild"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          description: "The channel to remove the welcome message from.",
          type: "channel",
          required: true,
        },
      ],

      async execute(client, message, args) {
        const channel = args.getChannel("channel");

        if (!channel || !message.guildId) return;

        const welcome = await client.prisma.welcome.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
        });

        if (!welcome) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(
                  client.i18n.t("commands.welcome.not_configured", {
                    channel: channel.toString(),
                  }),
                ),
              ),
            ],
          });

          return;
        }

        await client.prisma.welcome.delete({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
        });

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                client.i18n.t("commands.welcome.removed", {
                  channel: channel.toString(),
                }),
              ),
            ),
          ],
        });
      },
    }),
  ],
});
