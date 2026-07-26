import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { LastFMCommand, LastFMLink } from "@/commands/shared/lastfm";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";
import { MessageFlags } from "discord.js";

export default new MessageCommand({
  name: LastFMCommand.name,
  description: LastFMCommand.description,
  category: LastFMCommand.category,

  async execute(client, message, args) {
    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new Container().text(
          Text(
            `Try \`${client.prefix}${LastFMCommand.name} link <username>\` to get started.`,
          ),
        ),
      ],
    });
  },

  subcommands: [
    new MessageSubcommand({
      name: "link",
      description: "Link your Last.fm profile to the bot",

      arguments: [
        {
          name: "username",
          aliases: ["u"],
          type: "string",
          description: "Your Last.fm username.",
          required: true,
        },
      ],

      async execute(client, message, args) {
        const username = args.getString("username")!;

        try {
          await LastFMLink(message.author.id);
        } catch (error) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                "I couldn't link that Last.fm account. Double-check the username and try again.",
              ),
            ],
          });
          return;
        }

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(`Linked your Last.fm account as **${username}**.`),
            ),
          ],
        });
      },
    }),
  ],
});
