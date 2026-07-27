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

      async execute(client, message, args): Promise<void> {
        const channel = args.getChannel("channel")!;

        const content = args.getString("message");
        if (!content) return;

        const detected = detectScriptKind(content);

        if (detected.kind !== "text") {
          if (!detected.source) {
            await message.reply(
              detected.kind === "embed"
                ? "Provide an embed script after `{embed}`."
                : "Provide a CV2 script after `{cv2}`.",
            );
            return;
          }

          const compiled =
            detected.kind === "embed"
              ? compileEmbedScript(detected.source)
              : compileCv2Script(detected.source);

          if (!compiled.success) {
            await message.reply(compiled.error.message);
            return;
          }
        }

        const guildId = message.guild!.id;

        await client.prisma.guild.upsert({
          where: {
            id: guildId,
          },
          update: {},
          create: {
            id: guildId,
          },
        });

        await client.prisma.welcome.upsert({
          where: {
            guildId_channelId: {
              guildId,
              channelId: channel.id,
            },
          },
          update: {
            message: content,
          },
          create: {
            guildId,
            channelId: channel.id,
            message: content,
          },
        });

        await message.reply({
          flags: MessageFlags.IsComponentsV2,

          components: [
            new Container().addTextDisplayComponents(
              Text(`Successfully added a welcome message for ${channel}.`),
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

      async execute(client, message, args): Promise<void> {
        const channel = args.getChannel("channel")!;

        if (!channel.isTextBased() || !("send" in channel)) {
          await message.reply("That channel cannot receive messages.");
          return;
        }

        const welcome = await client.prisma.welcome.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guild!.id,
              channelId: channel.id,
            },
          },
        });

        if (!welcome) {
          await message.reply(
            `There is no welcome message configured for ${channel}.`,
          );
          return;
        }

        const source = replaceVariables(welcome.message, {
          user: message.author,
          guild: message.guild!,
        });

        const detected = detectScriptKind(source);

        switch (detected.kind) {
          case "text": {
            await channel.send(detected.source);
            return;
          }

          case "embed": {
            if (!detected.source) {
              await message.reply("The stored embed script is invalid.");
              return;
            }

            const compiled = compileEmbedScript(detected.source);

            if (!compiled.success) {
              await message.reply(compiled.error.message);
              return;
            }

            await channel.send({
              ...(compiled.result.content
                ? { content: compiled.result.content }
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

          case "cv2": {
            if (!detected.source) {
              await message.reply("The stored CV2 script is invalid.");
              return;
            }

            const compiled = compileCv2Script(detected.source);

            if (!compiled.success) {
              await message.reply(compiled.error.message);
              return;
            }

            await channel.send({
              flags: MessageFlags.IsComponentsV2,
              components: compiled.result.components,
            });
          }
        }
      },
    }),
    new MessageSubcommand({
      name: "list",
      description: "List all the welcome messages for each channel.",
      userPermissions: ["ManageGuild"],

      async execute(client, message, args) {
        if (!message.guildId) return;

        const welcomes = await client.prisma.welcome.findMany({
          where: {
            guildId: message.guildId,
          },
        });

        const container = new Container();

        if (welcomes.length === 0) {
          container.addTextDisplayComponents(
            Text("No welcome messages are configured."),
          );
        } else {
          container.addTextDisplayComponents(
            Text(
              `Welcome messages are configured in ${welcomes.length} channel${welcomes.length < 1 ? "s" : ""}:\n\n` +
                welcomes
                  .map((welcome) => `- <#${welcome.channelId}>`)
                  .join("\n"),
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
        const channel = args.getChannel("channel")!;

        const welcome = await client.prisma.welcome.findUnique({
          where: {
            guildId_channelId: {
              guildId: message.guild!.id,
              channelId: channel.id,
            },
          },
        });

        if (!welcome) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().addTextDisplayComponents(
                Text(`There is no welcome message configured for ${channel}.`),
              ),
            ],
          });
          return;
        }

        await client.prisma.welcome.delete({
          where: {
            guildId_channelId: {
              guildId: message.guild!.id,
              channelId: channel.id,
            },
          },
        });

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().addTextDisplayComponents(
              Text(`Successfully removed the welcome message from ${channel}.`),
            ),
          ],
        });
      },
    }),
  ],
});
