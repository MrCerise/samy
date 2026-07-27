import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import {
  getTimezone,
  getTimezoneDifference,
  setTimezone,
  unsetTimezone,
} from "@/commands/shared/timezone";
import { Container, Text } from "@/ui/components";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("timezone")
    .setDescription("View or set local timezones.")

    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set your local timezone.")
        .addStringOption((opt) =>
          opt
            .setName("timezone")
            .setDescription(
              "Timezone identifier (America/New_York, UTC, EST, etc).",
            )
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("get")
        .setDescription("View local time for a user.")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user whose timezone to view.")
            .setRequired(false),
        ),
    )

    .addSubcommand((sub) =>
      sub.setName("unset").setDescription("Remove your saved timezone."),
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
      const input = interaction.options.getString("timezone", true);

      await interaction.deferReply();

      try {
        const result = await setTimezone(client, interaction.user.id, input);

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                `Timezone set to \`${result.timezone}\` (${result.offsetString}).\n` +
                  `-# ${result.timeString} · ${result.dateString}`,
              ),
            ),
          ],
        });
      } catch (error) {
        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            errorUI(
              error instanceof Error ? error.message : "Invalid timezone.",
            ),
          ],
        });
      }

      return;
    }

    if (subcommand === "unset") {
      await interaction.deferReply();

      try {
        const removed = await unsetTimezone(client, interaction.user.id);

        if (!removed) {
          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [errorUI("You don't have a timezone set.")],
          });

          return;
        }

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [new Container().text(Text("Timezone removed."))],
        });
      } catch (error) {
        client.logger.error("Failed to unset timezone", {
          error,
          user: interaction.user.id,
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [errorUI("Couldn't remove your timezone right now.")],
        });
      }

      return;
    }

    if (subcommand === "get") {
      const targetUser =
        interaction.options.getUser("user") ?? interaction.user;

      await interaction.deferReply();

      try {
        const tzData = await getTimezone(client, targetUser.id);

        if (!tzData) {
          const self = targetUser.id === interaction.user.id;

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                self
                  ? "You haven't set your timezone yet. Use `/timezone set <timezone>`."
                  : `**${targetUser.username}** hasn't set their timezone yet.`,
              ),
            ],
          });

          return;
        }

        const self = targetUser.id === interaction.user.id;

        let metadata = `${tzData.timezone} (${tzData.offsetString})`;

        if (!self) {
          const callerTimezone = await getTimezone(client, interaction.user.id);

          if (callerTimezone) {
            metadata += ` · ${getTimezoneDifference(
              tzData.timezone,
              callerTimezone.timezone,
            )}`;
          }
        }

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(
                `${self ? "Your" : `**${targetUser.username}'s**`} local time\n` +
                  `**${tzData.timeString}** · ${tzData.dateString}\n` +
                  `-# ${metadata}`,
              ),
            ),
          ],
        });
      } catch (error) {
        client.logger.error("Failed to get timezone", {
          error,
          user: interaction.user.id,
        });

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            errorUI("An error occurred while fetching timezone info."),
          ],
        });
      }
    }
  },
});
