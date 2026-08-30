import { MessageFlags } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import {
  deliverLeaveMessage,
  validateLeaveMessage,
  leaveFailureMessage,
} from "@/commands/shared/leaver";
import { Container, Text } from "@/ui/components";

export default new MessageCommand({
  name: "leaver",
  description: "Configure leave messages for the server.",
  aliases: ["leave", "lv"],
  guildOnly: true,
  userPermissions: ["ManageGuild"],
  category: "Server",

  subcommands: [
    new MessageSubcommand({
      name: "add",
      description: "Add a leave message to a channel.",
      userPermissions: ["ManageGuild"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          description: "The channel to send the leave message to.",
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

        const validation = validateLeaveMessage(content);

        if (!validation.success) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(leaveFailureMessage(client, validation.failure)),
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

        await client.prisma.leave.upsert({
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
                client.i18n.t("commands.leave.added", {
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
      description: "Preview a configured leave message, or all of them.",
      userPermissions: ["ManageGuild"],
      aliases: ["view", "test"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          type: "channel",
          description:
            "The leave channel to preview. Leave empty to preview all leave messages",
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
          const leaves = await client.prisma.leave.findMany({
            where: {
              guildId: message.guildId,
            },
          });

          if (leaves.length === 0) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(client.i18n.t("commands.leave.none")),
                ),
              ],
            });

            return;
          }

          const failed: string[] = [];

          for (const leave of leaves) {
            const target = await message.guild.channels
              .fetch(leave.channelId)
              .catch(() => null);

            if (!target || !target.isTextBased() || !("send" in target)) {
              failed.push(`<#${leave.channelId}>`);
              continue;
            }

            const result = await deliverLeaveMessage(target, leave.message, {
              user: message.author,
              guild: message.guild,
              member,
            });

            if (!result.success) {
              failed.push(`<#${leave.channelId}>`);
            }
          }

          if (failed.length > 0) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("commands.leave.preview_all_partial", {
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
                  client.i18n.t("commands.leave.preview_all_done", {
                    count: leaves.length,
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
                Text(client.i18n.t("commands.leave.channel_unavailable")),
              ),
            ],
          });

          return;
        }

        const leave = await client.prisma.leave.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
        });

        if (!leave) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(
                  client.i18n.t("commands.leave.not_configured", {
                    channel: channel.toString(),
                  }),
                ),
              ),
            ],
          });

          return;
        }

        const result = await deliverLeaveMessage(channel, leave.message, {
          user: message.author,
          guild: message.guild,
          member,
        });

        if (!result.success) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(leaveFailureMessage(client, result.failure)),
              ),
            ],
          });
        }
      },
    }),

    new MessageSubcommand({
      name: "list",
      description: "List all configured leave messages.",
      userPermissions: ["ManageGuild"],

      async execute(client, message) {
        if (!message.guildId) return;

        const leaves = await client.prisma.leave.findMany({
          where: {
            guildId: message.guildId,
          },
        });

        const container = new Container();

        if (leaves.length === 0) {
          container.text(Text(client.i18n.t("commands.leave.none")));
        } else {
          container.text(
            Text(
              client.i18n.t("commands.leave.configured", {
                count: leaves.length,
                noun: leaves.length === 1 ? "channel" : "channels",
                channels: leaves
                  .map((leave) => `- <#${leave.channelId}>`)
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
      description: "Remove a leave message from a channel.",
      userPermissions: ["ManageGuild"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          description: "The channel to remove the leave message from.",
          type: "channel",
          required: true,
        },
      ],

      async execute(client, message, args) {
        const channel = args.getChannel("channel");

        if (!channel || !message.guildId) return;

        const leave = await client.prisma.leave.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guildId,
              channelId: channel.id,
            },
          },
        });

        if (!leave) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(
                  client.i18n.t("commands.leave.not_configured", {
                    channel: channel.toString(),
                  }),
                ),
              ),
            ],
          });

          return;
        }

        await client.prisma.leave.delete({
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
                client.i18n.t("commands.leave.removed", {
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
