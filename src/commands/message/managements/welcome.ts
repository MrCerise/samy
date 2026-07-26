import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { compileCv2Script } from "@/libs/scripting/cv2";
import { detectScriptKind } from "@/libs/scripting/detectScriptKind";
import { compileEmbedScript } from "@/libs/scripting/embed";

export default new MessageCommand({
  name: "welcomer",
  description: "Set up welcome messages in one or multiple channels.",
  aliases: ["welcome", "wc"],
  guildOnly: true,
  userPermissions: ["ManageGuild"],

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
        const content = args.getString("message")!;

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

        // TODO: Save to your database
        // await client.prisma.welcome.create({
        //   data: {
        //     guildId: message.guild!.id,
        //     channelId: channel.id,
        //     message: content,
        //   },
        // });

        await message.reply(
          `Successfully added a welcome message for ${channel}.`,
        );
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
            `There isn't a welcome message configured for ${channel}.`,
          );
          return;
        }

        const source = welcome.message
          .replaceAll("{user}", message.author.toString())
          .replaceAll("{user.name}", message.author.username)
          .replaceAll("{server}", message.guild!.name)
          .replaceAll("{memberCount}", message.guild!.memberCount.toString());

        const detected = detectScriptKind(source);

        switch (detected.kind) {
          case "text":
            await channel.send(detected.source);
            return;

          case "embed": {
            const compiled = compileEmbedScript(detected.source!);

            if (!compiled.success) {
              await message.reply(compiled.error.message);
              return;
            }

            await channel.send({
              ...(compiled.result.content
                ? { content: compiled.result.content }
                : {}),
              embeds: [compiled.result.embed],
              ...(compiled.result.components.length
                ? { components: compiled.result.components }
                : {}),
            });

            return;
          }

          case "cv2": {
            const compiled = compileCv2Script(detected.source!);

            if (!compiled.success) {
              await message.reply(compiled.error.message);
              return;
            }

            await channel.send({
              flags: MessageFlags.IsComponentsV2,
              components: compiled.result.components,
            });

            return;
          }
        }
      },
    }),
  ],
});
