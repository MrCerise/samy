import { MessageFlags } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import { detectScriptKind } from "@/libs/scripting/detectScriptKind";
import { compileEmbedScript } from "@/libs/scripting/embed";
import { replaceVariables } from "@/libs/scripting/variables";
import { Container, Text } from "@/ui/components";

export default new MessageCommand({
  name: "welcomer",
  description: "Set up welcome messages in one or multiple channels.",
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

        const detected = detectScriptKind(content);

        if (detected.kind !== "text") {
          if (!detected.source) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t(
                      detected.kind === "embed"
                        ? "commands.builder.missing_embed"
                        : "commands.builder.missing_cv2",
                    ),
                  ),
                ),
              ],
            });

            return;
          }

          const compiled =
            detected.kind === "embed"
              ? compileEmbedScript(detected.source)
              : compileCv2Script(detected.source);

          if (!compiled.success) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [new Container().text(Text(compiled.error.message))],
            });

            return;
          }
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
      description: "Preview a configured welcome message.",
      userPermissions: ["ManageGuild"],

      arguments: [
        {
          name: "channel",
          aliases: ["c"],
          type: "channel",
          description: "The welcome channel to preview.",
          required: true,
        },
      ],

      async execute(client, message, args) {
        const channel = args.getChannel("channel");

        if (!channel || !message.guildId) return;

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

        const source = replaceVariables(welcome.message, {
          user: message.author,
          guild: message.guild!,
        });

        const detected = detectScriptKind(source);

        if (detected.kind === "text") {
          await channel.send(detected.source);
          return;
        }

        if (detected.kind === "embed") {
          if (!detected.source) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(client.i18n.t("commands.welcome.invalid_embed")),
                ),
              ],
            });

            return;
          }

          const compiled = compileEmbedScript(detected.source);

          if (!compiled.success) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [new Container().text(Text(compiled.error.message))],
            });

            return;
          }

          await channel.send({
            ...(compiled.result.content
              ? {
                  content: compiled.result.content,
                }
              : {}),
            embeds: [compiled.result.embed],
            ...(compiled.result.components.length > 0
              ? {
                  components: compiled.result.components,
                }
              : {}),
          });

          return;
        }

        if (!detected.source) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(client.i18n.t("commands.welcome.invalid_cv2")),
              ),
            ],
          });

          return;
        }

        const compiled = compileCv2Script(detected.source);

        if (!compiled.success) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [new Container().text(Text(compiled.error.message))],
          });

          return;
        }

        await channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: compiled.result.components,
        });
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
