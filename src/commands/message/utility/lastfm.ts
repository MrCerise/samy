import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import {
  LastFMLink,
  LastFMNow,
  LastFMNowUsername,
} from "@/commands/shared/lastfm";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";
import LastFMNowUI from "@/ui/lastfm/now";
import { MessageFlags } from "discord.js";

export default new MessageCommand({
  name: "lastfm",
  description:
    "View your Last.fm profile, recent tracks, and overall statistics",
  category: "Utility",
  aliases: ["fm"],
  arguments: [
    {
      name: "user",
      aliases: ["u"],
      type: "user",
      description: "A Discord user (mention or ID) to view.",
      required: false,
    },
  ],

  async execute(client, message, args) {
    try {
      const userArg = args.getUser("user");

      let nowPlaying;

      if (userArg) {
        const linkedUser = await client.lastFm.getUser(userArg.id);

        if (!linkedUser) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI("That user doesn't have a Last.fm account linked."),
            ],
          });

          return;
        }

        nowPlaying = await LastFMNowUsername(linkedUser.username);
      } else {
        nowPlaying = await LastFMNow(client, message.author.id);
      }

      if (!nowPlaying) {
        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [new Container().text(Text("No recent tracks found."))],
        });

        return;
      }

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [LastFMNowUI(nowPlaying)],
      });
    } catch (error) {
      client.logger.error("Failed to get Last.fm track", {
        error,
        user: message.author.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(
            "I couldn't find that Last.fm profile or get its recent tracks.",
          ),
        ],
      });
    }
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
        const username = args.getString("username");

        if (!username) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [errorUI("You need to provide a Last.fm username.")],
          });

          return;
        }

        try {
          const profile = await LastFMLink(client, message.author.id, username);

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(`Linked your Last.fm account as **${profile.name}**.`),
              ),
            ],
          });
        } catch (error) {
          client.logger.error("Failed to link Last.fm account", {
            error,
            user: message.author.id,
            username,
          });

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                "I couldn't link that Last.fm account. Double-check the username and make sure the profile is public.",
              ),
            ],
          });
        }
      },
    }),

    new MessageSubcommand({
      name: "unlink",
      description: "Remove your linked Last.fm account",

      async execute(client, message) {
        try {
          const user = await client.lastFm.getUser(message.author.id);

          if (!user) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [errorUI("You don't have a Last.fm account linked.")],
            });

            return;
          }

          await client.lastFm.deleteUser(message.author.id);

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(`Unlinked your Last.fm account **${user.username}**.`),
              ),
            ],
          });
        } catch (error) {
          client.logger.error("Failed to unlink Last.fm account", {
            error,
            user: message.author.id,
          });

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [errorUI("I couldn't unlink your Last.fm account.")],
          });
        }
      },
    }),
  ],
});
