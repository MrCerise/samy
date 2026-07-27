import { MessageFlags, time, TimestampStyles } from "discord.js";

import Event from "@/classes/Event";
import { MessageCommand, MessageSubcommand } from "@/classes/Command";
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

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);

    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command =
      client.messageCommands.get(commandName) ??
      client.messageCommands.find((cmd) => cmd.aliases.includes(commandName));

    if (!command) return;

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

          if (!current.execute) {
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
