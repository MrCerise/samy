import { MessageFlags, PermissionFlagsBits } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { SamyResult } from "@/commands/shared/samy";

export default new ButtonHandler({
  namespace: "samy",
  action: "again",
  invokerOnly: false,

  async execute(client, interaction, params, invokerId) {
    const originalWasEphemeral = interaction.message.flags.has(
      MessageFlags.Ephemeral,
    );

    const isDMContext = !interaction.inGuild();

    const botInGuild = interaction.guildId
      ? !!client.guilds.cache.get(interaction.guildId)?.members.me
      : false;
    const isOriginalInvoker = interaction.user.id === invokerId;

    const canUseCommands = botInGuild
      ? (interaction.memberPermissions?.has(
          PermissionFlagsBits.UseApplicationCommands,
        ) ?? false)
      : true;

    const sendEphemeral =
      originalWasEphemeral ||
      (!isDMContext && (!isOriginalInvoker || !canUseCommands));

    console.log(
      originalWasEphemeral,
      isDMContext,
      isOriginalInvoker,
      canUseCommands,
    );

    const container = await SamyResult(
      client,
      interaction.user.id,
      interaction.user,
    );

    await interaction.reply({
      flags: sendEphemeral
        ? MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        : MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
