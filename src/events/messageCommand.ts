import { Message, MessageFlags, time, TimestampStyles } from "discord.js";

import Event from "@/classes/Event";
import { MessageCommand, MessageSubcommand } from "@/classes/Command";
import { buildCommandView, buildSubcommandView } from "@/ui/help";
import { buildHelp } from "@/utils/parser/HelpGenerator";

import { checkCooldown, setCooldown } from "@/utils/cooldown";
import { checkPermissions } from "@/utils/permission";

import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

export default new Event({
  name: "messageCreate",

  async execute(client, message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (!message.channel.isTextBased() || !("guild" in message.channel)) {
      return;
    }

    const guild = message.guild;
    const channel = message.channel;

    const prefix = client.prefix;

    const notifyIfAfk = async () => {
      const afkKey = `${guild.id}:${message.author.id}`;
      const afk = client.afkUsers.get(afkKey);

      if (!afk) return;

      client.afkUsers.delete(afkKey);
      try {
        await client.prisma.afk.deleteMany({
          where: {
            userId: message.author.id,
            guildId: guild.id,
          },
        });
      } catch (error) {
        client.logger.error("Failed to clear AFK record", {
          error,
          user: message.author.id,
          guild: guild.id,
        });
        return;
      }
      await client.i18n.withResolvedLocale(
        {
          userId: message.author.id,
          guildId: guild.id,
        },
        async () => {
          await message
            .reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("commands.afk.removed", {
                      duration: time(
                        Math.floor(afk.createdAt.getTime() / 1000),
                        TimestampStyles.RelativeTime,
                      ),
                    }),
                  ),
                ),
              ],
            })
            .then(async (m) => {
              deleteMsg(m);
            });
        },
      );
    };
    const deleteMsg = async (m: Message) => {
      await Bun.sleep(5000);
      if (m.deletable) m.delete();
    };

    const notifyMentionedAfk = async () => {
      const mentionedIds = new Set<string>();

      for (const user of message.mentions.users.values()) {
        mentionedIds.add(user.id);
      }

      if (message.mentions.repliedUser) {
        mentionedIds.add(message.mentions.repliedUser.id);
      }

      mentionedIds.delete(message.author.id);

      if (mentionedIds.size === 0) return;

      const lines: string[] = [];

      for (const userId of mentionedIds) {
        const afk = client.afkUsers.get(`${guild.id}:${userId}`);

        if (!afk) continue;

        lines.push(
          client.i18n.t("commands.afk.mentioned", {
            user: `<@${userId}>`,
            reason: afk.reason ?? client.i18n.t("commands.afk.default_reason"),
            time: time(
              Math.floor(afk.createdAt.getTime() / 1000),
              TimestampStyles.RelativeTime,
            ),
          }),
        );
      }

      if (lines.length === 0) return;

      await client.i18n.withResolvedLocale(
        {
          userId: message.author.id,
          guildId: guild.id,
        },
        async () => {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {
              parse: [],
            },
            components: [new Container().text(Text(lines.join("\n")))],
          });
        },
      );
    };

    await notifyMentionedAfk();
    await notifyIfAfk();

    if (!message.content.startsWith(prefix)) {
      return;
    }

    const args = message.content.slice(prefix.length).trim().split(/\s+/);

    const commandName = args.shift()?.toLowerCase();

    if (!commandName) {
      await notifyIfAfk();
      return;
    }

    const command =
      client.messageCommands.get(commandName) ??
      client.messageCommands.find((cmd) => cmd.aliases.includes(commandName));

    if (!command) {
      await notifyIfAfk();
      return;
    }

    await client.i18n.withResolvedLocale(
      {
        userId: message.author.id,
        guildId: guild.id,
      },
      async () => {
        let current: MessageCommand | MessageSubcommand = command;
        const path: string[] = [];

        const botMember = guild.members.me;

        if (!botMember) return;

        if (
          !checkPermissions(botMember, channel, [
            "ReadMessageHistory",
            "SendMessages",
          ])
        ) {
          return;
        }

        const start = performance.now();

        try {
          while (args.length > 0) {
            const name = args[0];

            if (!name) break;

            const next = current.find(name.toLowerCase());

            if (!next) break;

            args.shift();
            path.push(next.name);

            current = next;
          }

          if (!current.hasExecute) {
            const category = command.options.category ?? "Uncategorized";
            const userId = message.author.id;

            const view =
              path.length === 0
                ? buildCommandView(client, userId, category, command.name)
                : buildSubcommandView(
                    client,
                    userId,
                    category,
                    command.name,
                    path,
                  );

            if (!view) {
              return;
            }

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [view],
            });

            return;
          }

          const member = message.member;

          if (!member) return;

          if (!checkPermissions(member, channel, current.userPermissions)) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(client.i18n.t("errors.missing_permissions")),
                ),
              ],
            });

            return;
          }

          if (!checkPermissions(botMember, channel, current.botPermissions)) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(client.i18n.t("errors.bot_missing_permissions")),
                ),
              ],
            });

            return;
          }

          const usageName = [command.name, ...path].join(" ");

          const parsed = await current.parse(client, message, args.join(" "));

          if (!parsed.success) {
            const errorList = parsed.errors
              .map((error) => `• ${error.message}`)
              .join("\n");

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                errorUI(
                  `${errorList}\n\n${buildHelp(
                    {
                      prefix,
                      name: usageName,
                    },
                    current.arguments,
                  )}`,
                ),
              ],
            });

            return;
          }

          const cooldown = current.cooldown ?? client.config.defaults.cooldown;

          const remaining = checkCooldown(
            client,
            "message",
            message.author.id,
            current,
            {
              path,
            },
          );

          if (remaining) {
            const retryAt = Math.floor(Date.now() / 1000) + remaining;

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("errors.cooldown", {
                      time: time(retryAt, TimestampStyles.RelativeTime),
                    }),
                  ),
                ),
              ],
            });

            return;
          }

          setCooldown(client, "message", message.author.id, current, cooldown, {
            path,
          });

          const commandPath = [command.name, ...path].join(":");

          client.logger.info("Executing message command", {
            command: commandPath,
            user: message.author.id,
            guild: guild.id,
            channel: channel.id,
          });

          await channel.sendTyping();
          await current.execute(client, message, parsed.args);

          client.logger.info("Message command completed", {
            command: commandPath,
            user: message.author.id,
            guild: guild.id,
            channel: channel.id,
            duration: `${(performance.now() - start).toFixed(2)}ms`,
          });
        } catch (error) {
          const commandPath = [command.name, ...path].join(":");

          client.logger.error("Error executing message command", {
            error,
            command: commandPath,
            user: message.author.id,
            guild: guild.id,
            channel: channel.id,
            duration: `${(performance.now() - start).toFixed(2)}ms`,
          });

          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [errorUI(client.i18n.t("errors.command_failed"))],
          });
        }
      },
    );
  },
});
