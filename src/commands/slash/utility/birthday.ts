import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
  time,
  TimestampStyles,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import {
  getBirthday,
  getUpcomingBirthdays,
  setBirthday,
  unsetBirthday,
} from "@/commands/shared/birthday";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("View, set, or list user birthdays.")

    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set your birthday.")
        .addStringOption((opt) =>
          opt
            .setName("date")
            .setDescription("Your birthday (MM/DD/YYYY, MM/DD, or May 15).")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("get")
        .setDescription("View birthday of a user.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user whose birthday to view.")
            .setRequired(false),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("upcoming")
        .setDescription("List upcoming birthdays in the server."),
    )

    .addSubcommand((sub) =>
      sub.setName("unset").setDescription("Remove your saved birthday."),
    )

    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    )

    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ),

  category: "Utility",

  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const input = interaction.options.getString("date", true);

      await interaction.deferReply();

      try {
        const result = await setBirthday(client, interaction.user.id, input);

        const next =
          result.daysUntil === 0
            ? "Today!"
            : time(result.nextBirthdayTimestamp, TimestampStyles.RelativeTime);

        const age = result.age !== undefined ? ` · Turning ${result.age}` : "";

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                `Birthday saved: **${result.formattedDate}**\n` +
                  `-# ${next}${age}`,
              ),
            ),
          ],
        });
      } catch (error) {
        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            errorUI(
              error instanceof Error ? error.message : "Invalid birthday date.",
            ),
          ],
        });
      }

      return;
    }

    if (subcommand === "unset") {
      await interaction.deferReply();

      try {
        const removed = await unsetBirthday(client, interaction.user.id);

        if (!removed) {
          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [errorUI("You don't have a birthday set.")],
          });

          return;
        }

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [new Container().text(Text("Birthday removed."))],
        });
      } catch (error) {
        client.logger.error("Failed to unset birthday", {
          error,
          user: interaction.user.id,
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [errorUI("Couldn't remove your birthday right now.")],
        });
      }

      return;
    }

    if (subcommand === "get") {
      const targetUser =
        interaction.options.getUser("user") ?? interaction.user;

      await interaction.deferReply();

      try {
        const bday = await getBirthday(client, targetUser.id);

        if (!bday) {
          const self = targetUser.id === interaction.user.id;

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                self
                  ? "You haven't set your birthday yet. Use `/birthday set <date>`."
                  : `**${targetUser.username}** hasn't set their birthday yet.`,
              ),
            ],
          });

          return;
        }

        const self = targetUser.id === interaction.user.id;

        const next =
          bday.daysUntil === 0
            ? "Today!"
            : time(bday.nextBirthdayTimestamp, TimestampStyles.RelativeTime);

        const age = bday.age !== undefined ? ` · Turning ${bday.age}` : "";

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                `${self ? "Your" : `**${targetUser.username}'s**`} birthday\n` +
                  `**${bday.formattedDate}**\n` +
                  `-# ${next}${age}`,
              ),
            ),
          ],
        });
      } catch (error) {
        client.logger.error("Failed to get birthday", {
          error,
          user: interaction.user.id,
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            errorUI("An error occurred while fetching birthday info."),
          ],
        });
      }

      return;
    }
    if (subcommand === "upcoming") {
      if (!interaction.guild) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [errorUI("This command can only be used in a server.")],
        });

        return;
      }

      await interaction.deferReply();

      try {
        const members = await interaction.guild.members.fetch();

        const memberIds = Array.from(members.keys());

        const upcoming = await getUpcomingBirthdays(client, memberIds);

        if (upcoming.length === 0) {
          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(Text("No birthdays have been set yet.")),
            ],
          });

          return;
        }

        const lines = upcoming.slice(0, 10).map((bday) => {
          const member = members.get(bday.userId);

          const name = member
            ? `**${member.user.username}**`
            : `<@${bday.userId}>`;

          const when =
            bday.daysUntil === 0
              ? "Today!"
              : time(bday.nextBirthdayTimestamp, TimestampStyles.RelativeTime);

          return `${name} — ${bday.mmddyyyy} (${when})`;
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(`Upcoming birthdays\n` + lines.join("\n")),
            ),
          ],
        });
      } catch (error) {
        client.logger.error("Failed to list upcoming birthdays", {
          error,
          guild: interaction.guild.id,
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [errorUI("Couldn't fetch upcoming birthdays.")],
        });
      }
    }
  },
});
