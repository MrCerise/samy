import { Message, MessageFlags, time, TimestampStyles } from "discord.js";

import Event from "@/classes/Event";
import { MessageCommand, MessageSubcommand } from "@/classes/Command";

import { buildCommandView, buildSubcommandView } from "@/ui/help";

import { buildHelp } from "@/utils/parser/HelpGenerator";

import { checkCooldown, setCooldown } from "@/utils/cooldown";

import { checkPermissions, getMissingPermissions } from "@/utils/permission";

import {
  getGuildPrefix,
  getUserPrefix,
  getAlias,
  resolveAlias,
  isCommandEnabled,
  isCommandRestricted,
  hasFakeAdministratorPermission,
} from "@/utils/settings";

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

    client.logger.debug("Processing message", {
      user: message.author.id,
      guild: guild.id,
      channel: channel.id,
      content: message.content,
    });

    const [guildPrefix, userPrefix] = await Promise.all([
      getGuildPrefix(guild.id, client),
      getUserPrefix(message.author.id, client),
    ]);

    const defaultPrefix = client.prefix;

    const prefixes = Array.from(
      new Set(
        [userPrefix, guildPrefix, defaultPrefix].filter(
          (p): p is string => p !== null && p !== undefined && p.length > 0,
        ),
      ),
    ).sort((a, b) => b.length - a.length);

    const matchedPrefix = prefixes.find((p) => message.content.startsWith(p));

    client.logger.debug("Resolved message prefixes", {
      guild: guild.id,
      user: message.author.id,
      prefixes,
      matchedPrefix,
    });

    if (!matchedPrefix) return;

    const deleteMsg = async (m: Message) => {
      await Bun.sleep(5000);

      if (m.deletable) {
        await m.delete();
      }
    };

    const notifyIfAfk = async () => {
      const afkKey = `${guild.id}:${message.author.id}`;

      const afk = client.afkUsers.get(afkKey);

      client.logger.debug("Checking author AFK status", {
        user: message.author.id,
        guild: guild.id,
        isAfk: Boolean(afk),
      });

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

      client.logger.debug("Removed AFK status", {
        user: message.author.id,
        guild: guild.id,
      });

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
            .then(deleteMsg);
        },
      );
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

      client.logger.debug("Checking mentioned users for AFK", {
        user: message.author.id,
        guild: guild.id,
        mentionedUsers: [...mentionedIds],
      });

      if (mentionedIds.size === 0) {
        return;
      }

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

      client.logger.debug("Found mentioned AFK users", {
        guild: guild.id,
        users: [...mentionedIds],
      });

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

    let args = message.content.slice(matchedPrefix.length).trim().split(/\s+/);

    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    client.logger.debug("Resolving message command", {
      commandName,
      args,
      user: message.author.id,
      guild: guild.id,
    });

    let command =
      client.messageCommands.get(commandName) ??
      client.messageCommands.find((cmd) => cmd.aliases.includes(commandName));

    if (command) {
      client.logger.debug("Command resolved directly", {
        command: command.name,
        input: commandName,
      });
    }

    if (!command) {
      const aliasTemplate = await getAlias(guild.id, commandName, client);

      client.logger.debug("Checking custom command alias", {
        commandName,
        found: Boolean(aliasTemplate),
      });

      if (aliasTemplate) {
        const resolved = resolveAlias(aliasTemplate, args);

        client.logger.debug("Resolved custom alias", {
          alias: commandName,
          command: resolved.commandName,
          args: resolved.args,
        });

        command =
          client.messageCommands.get(resolved.commandName) ??
          client.messageCommands.find((cmd) =>
            cmd.aliases.includes(resolved.commandName),
          );

        args = resolved.args;
      }
    }

    if (!command) {
      client.logger.debug("Message command not found", {
        commandName,
        user: message.author.id,
        guild: guild.id,
      });

      return;
    }

    client.logger.debug("Message command resolved", {
      command: command.name,
      args,
      user: message.author.id,
      guild: guild.id,
    });

    await client.i18n.withResolvedLocale(
      {
        userId: message.author.id,
        guildId: guild.id,
      },
      async () => {
        let current: MessageCommand | MessageSubcommand = command;

        const path: string[] = [];

        const requiredUserPermissions = [...(command.userPermissions ?? [])];

        const requiredBotPermissions = [...(command.botPermissions ?? [])];

        const botMember = guild.members.me;

        if (!botMember) {
          client.logger.debug("Bot member not found", {
            guild: guild.id,
          });

          return;
        }

        if (
          !(await checkPermissions(botMember, channel, [
            "ReadMessageHistory",
            "SendMessages",
          ]))
        ) {
          client.logger.debug("Bot cannot read/send messages", {
            guild: guild.id,
            channel: channel.id,
          });

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

            client.logger.debug("Resolved subcommand", {
              command: command.name,
              subcommand: next.name,
              path,
            });

            if (current.userPermissions) {
              requiredUserPermissions.push(...current.userPermissions);
            }

            if (current.botPermissions) {
              requiredBotPermissions.push(...current.botPermissions);
            }
          }

          const effectiveUserPermissions = [
            ...new Set(requiredUserPermissions),
          ];

          const effectiveBotPermissions = [...new Set(requiredBotPermissions)];

          const commandPath = [command.name, ...path].join(":").toLowerCase();

          const member = message.member;

          if (!member) {
            client.logger.debug("Message member unavailable", {
              user: message.author.id,
              guild: guild.id,
            });

            return;
          }

          const isOwner = client.config.devs.includes(member.id);

          client.logger.debug("Checking command access", {
            command: commandPath,
            user: member.id,
            isOwner,
          });

          const topLevelCommandName = command.name.toLowerCase();

          const commandEnabled = await isCommandEnabled(
            guild.id,
            topLevelCommandName,
            channel.id,
            member.id,
            client,
          );

          client.logger.debug("Command enabled check", {
            command: topLevelCommandName,
            enabled: commandEnabled,
            guild: guild.id,
            channel: channel.id,
            user: member.id,
            isOwner,
          });

          if (!commandEnabled) {
            client.logger.debug("Command blocked because it is disabled", {
              command: topLevelCommandName,
              guild: guild.id,
              channel: channel.id,
              user: member.id,
              isOwner,
            });

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("errors.command_disabled", {
                      command: topLevelCommandName,
                    }),
                  ),
                ),
              ],
            });

            return;
          }

          const effectiveGuildOnly =
            command.options.guildOnly === true ||
            current.options?.guildOnly === true;

          if (effectiveGuildOnly && !message.guild) {
            client.logger.debug("Command blocked: guild only", {
              command: commandPath,
            });

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(Text(client.i18n.t("errors.guild_only"))),
              ],
            });

            return;
          }

          const effectiveOwnerOnly =
            command.options.ownerOnly === true ||
            current.options?.ownerOnly === true;

          if (effectiveOwnerOnly && !isOwner) {
            client.logger.debug("Command blocked: owner only", {
              command: commandPath,
              user: member.id,
            });

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(Text(client.i18n.t("errors.owner_only"))),
              ],
            });

            return;
          }

          const restrictions = await isCommandRestricted(
            guild.id,
            commandPath,
            client,
          );

          client.logger.debug("Command restrictions resolved", {
            command: commandPath,
            restrictions: restrictions.map((restriction) => ({
              id: restriction.id,
              command: restriction.command,
              roleId: restriction.roleId,
            })),
          });

          if (restrictions.length > 0) {
            const userRoles = [...member.roles.cache.keys()];

            const hasRealAdmin = member.permissions.has("Administrator");

            const hasFakeAdmin = await hasFakeAdministratorPermission(
              guild.id,
              member.id,
              userRoles,
              client,
            );

            const isAdmin = hasRealAdmin || hasFakeAdmin;

            const hasAllowedRole = restrictions.some((restriction) =>
              member.roles.cache.has(restriction.roleId),
            );

            client.logger.debug("Command restriction check", {
              command: commandPath,
              user: member.id,
              userRoles,
              restrictedRoles: restrictions.map(
                (restriction) => restriction.roleId,
              ),
              allowedRole: hasAllowedRole,
              hasRealAdmin,
              hasFakeAdmin,
              isAdmin,
              isOwner,
            });

            if (!isAdmin && !hasAllowedRole) {
              client.logger.debug("Command blocked by role restriction", {
                command: commandPath,
                user: member.id,
                hasRealAdmin,
                hasFakeAdmin,
                isOwner,
              });

              await message.reply({
                flags: MessageFlags.IsComponentsV2,
                components: [
                  new Container().text(
                    Text(
                      client.i18n.t("errors.command_restricted", {
                        command: commandPath,
                      }),
                    ),
                  ),
                ],
              });

              return;
            }

            client.logger.debug("Command restriction bypassed", {
              command: commandPath,
              user: member.id,
              reason: hasRealAdmin
                ? "real_administrator"
                : hasFakeAdmin
                  ? "fake_administrator"
                  : "allowed_role",
            });
          }

          if (!current.hasExecute) {
            client.logger.debug(
              "Command has no execute handler, showing help",
              {
                command: commandPath,
              },
            );

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
              client.logger.debug("Failed to build command help view", {
                command: commandPath,
              });

              return;
            }

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [view],
            });

            return;
          }

          client.logger.debug("Checking user permissions", {
            command: commandPath,
            user: member.id,
            permissions: effectiveUserPermissions,
          });

          const missingUserPermissions = await getMissingPermissions(
            member,
            channel,
            effectiveUserPermissions,
          );

          if (missingUserPermissions.length > 0) {
            client.logger.debug("User missing required permissions", {
              command: commandPath,
              user: member.id,
              permissions: effectiveUserPermissions,
              missing: missingUserPermissions,
            });

            const permissionList = missingUserPermissions
              .map((permission) => `• \`${String(permission)}\``)
              .join("\n");

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("errors.missing_permissions", {
                      permissions: permissionList,
                    }),
                  ),
                ),
              ],
            });

            return;
          }

          client.logger.debug("Checking bot permissions", {
            command: commandPath,
            permissions: effectiveBotPermissions,
          });

          const missingBotPermissions = await getMissingPermissions(
            botMember,
            channel,
            effectiveBotPermissions,
          );

          if (missingBotPermissions.length > 0) {
            client.logger.debug("Bot missing required permissions", {
              command: commandPath,
              permissions: effectiveBotPermissions,
              missing: missingBotPermissions,
            });

            const permissionList = missingBotPermissions
              .map((permission) => `• \`${String(permission)}\``)
              .join("\n");

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                new Container().text(
                  Text(
                    client.i18n.t("errors.bot_missing_permissions", {
                      permissions: permissionList,
                    }),
                  ),
                ),
              ],
            });

            return;
          }

          const usageName = [command.name, ...path].join(" ");

          client.logger.debug("Parsing command arguments", {
            command: commandPath,
            input: args.join(" "),
          });

          const parsed = await current.parse(client, message, args.join(" "));

          if (!parsed.success) {
            client.logger.debug("Command argument parsing failed", {
              command: commandPath,
              errors: parsed.errors.map((error) => error.message),
            });

            const errorList = parsed.errors
              .map((error) => {
                let msg = `• ${error.message}`;

                if (error.usage) {
                  msg += `\n  Usage: \`${error.usage}\``;
                }

                return msg;
              })
              .join("\n");

            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [
                errorUI(
                  `${errorList}\n\n${buildHelp(
                    {
                      prefix: matchedPrefix,
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

          client.logger.debug("Cooldown check", {
            command: commandPath,
            user: message.author.id,
            remaining,
            cooldown,
          });

          if (remaining) {
            client.logger.debug("Command blocked by cooldown", {
              command: commandPath,
              user: message.author.id,
              remaining,
            });

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
