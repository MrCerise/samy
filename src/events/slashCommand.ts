import {
  MessageFlags,
  TimestampStyles,
  time,
  type GuildMember,
  type InteractionReplyOptions,
} from "discord.js";

import Event from "@/classes/Event";
import { checkCooldown, setCooldown } from "@/utils/cooldown";
import { checkPermissions } from "@/utils/permission";
import errorUI from "@/ui/error";

export default new Event({
  name: "interactionCreate",

  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    await client.i18n.withResolvedLocale(
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        interactionLocale: interaction.locale,
      },
      async () => {
        client.logger.info("Received slash command", {
          command: interaction.commandName,
          user: interaction.user.id,
          guild: interaction.guildId,
          channel: interaction.channelId,
        });

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) {
          client.logger.info("Unknown slash command", {
            command: interaction.commandName,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
          });

          return;
        }

        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);

        const commandPath = [interaction.commandName, group, subcommand]
          .filter(Boolean)
          .join(":");

        if (command.guildOnly && !interaction.inGuild()) {
          await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [errorUI(client.i18n.t("errors.guild_only"))],
          });

          return;
        }

        if (interaction.inGuild() && interaction.guild) {
          const member = interaction.member as GuildMember;
          const botMember = interaction.guild.members.me;

          if (!botMember) {
            client.logger.warn("Bot member unavailable", {
              command: commandPath,
              guild: interaction.guildId,
            });

            return;
          }

          const channel =
            interaction.channel ??
            (await client.channels
              .fetch(interaction.channelId)
              .catch(() => null));

          if (!channel || !channel.isTextBased() || channel.isDMBased()) {
            client.logger.warn("Unable to resolve guild text channel", {
              command: commandPath,
              guild: interaction.guildId,
              channel: interaction.channelId,
            });

            return;
          }

          if (!checkPermissions(member, channel, command.userPermissions)) {
            await interaction.reply({
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              components: [
                errorUI(client.i18n.t("errors.missing_permissions")),
              ],
            });

            return;
          }

          if (!checkPermissions(botMember, channel, command.botPermissions)) {
            await interaction.reply({
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              components: [
                errorUI(client.i18n.t("errors.bot_missing_permissions")),
              ],
            });

            return;
          }
        }

        const cooldown = command.cooldown ?? client.config.defaults.cooldown;

        const remaining = checkCooldown(
          client,
          "slash",
          interaction.user.id,
          command,
          { interaction },
        );

        if (remaining) {
          const retryAt = Math.floor(Date.now() / 1000) + remaining;

          await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [
              errorUI(
                client.i18n.t("errors.cooldown", {
                  time: time(retryAt, TimestampStyles.RelativeTime),
                }),
              ),
            ],
          });

          return;
        }

        setCooldown(client, "slash", interaction.user.id, command, cooldown, {
          interaction,
        });

        const start = performance.now();

        try {
          client.logger.info("Executing slash command", {
            command: commandPath,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
          });

          await command.execute(client, interaction);

          client.logger.info("Slash command completed", {
            command: commandPath,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
            duration: `${(performance.now() - start).toFixed(2)}ms`,
          });
        } catch (error) {
          client.logger.error("Error executing slash command", {
            error,
            command: commandPath,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
            duration: `${(performance.now() - start).toFixed(2)}ms`,
          });

          const reply: InteractionReplyOptions = {
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [errorUI(client.i18n.t("errors.command_failed"))],
          };

          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
          } else {
            await interaction.reply(reply);
          }
        }
      },
    );
  },
});
