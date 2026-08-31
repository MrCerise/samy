import {
  MessageFlags,
  type InteractionReplyOptions,
} from "discord.js";

import Event from "@/classes/Event";
import { parseCustomId } from "@/classes/Interaction";
import errorUI from "@/ui/error";

export default new Event({
  name: "interactionCreate",

  async execute(client, interaction) {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    const { namespace, action, params, invokerId } = parseCustomId(
      interaction.customId,
    );

    if (!namespace || !action || !invokerId) return;
    if (action === "noop") return;

    const handlerName = `${namespace}:${action}`;

    if (interaction.isButton()) {
      const handler = client.buttonHandlers.get(handlerName);
      if (!handler) return;

      await client.i18n.withResolvedLocale(
        {
          userId: interaction.user.id,
          guildId: interaction.guildId,
          interactionLocale: interaction.locale,
        },
        async () => {
          if (handler.invokerOnly && interaction.user.id !== invokerId) {
            await interaction.reply({
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              components: [errorUI(client.i18n.t("errors.not_your_menu"))],
            });
            return;
          }

          if (handler.guildOnly && !interaction.inGuild()) {
            await interaction.reply({
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
              components: [errorUI(client.i18n.t("errors.guild_only"))],
            });
            return;
          }

          const start = performance.now();

          try {
            client.logger.info("Executing component handler", {
              handler: handlerName,
              user: interaction.user.id,
              guild: interaction.guildId,
              channel: interaction.channelId,
            });

            await handler.execute(client, interaction, params, invokerId);

            client.logger.info("Component handler completed", {
              handler: handlerName,
              user: interaction.user.id,
              guild: interaction.guildId,
              channel: interaction.channelId,
              duration: `${(performance.now() - start).toFixed(2)}ms`,
            });
          } catch (error) {
            client.logger.error("Error executing component handler", {
              error,
              handler: handlerName,
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

      return;
    }

    const handler = client.selectHandlers.get(handlerName);
    if (!handler) return;

    await client.i18n.withResolvedLocale(
      {
        userId: interaction.user.id,
        guildId: interaction.guildId,
        interactionLocale: interaction.locale,
      },
      async () => {
        if (interaction.user.id !== invokerId) {
          await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [errorUI(client.i18n.t("errors.not_your_menu"))],
          });
          return;
        }

        if (handler.guildOnly && !interaction.inGuild()) {
          await interaction.reply({
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            components: [errorUI(client.i18n.t("errors.guild_only"))],
          });
          return;
        }

        const start = performance.now();

        try {
          client.logger.info("Executing component handler", {
            handler: handlerName,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
          });

          const value = interaction.values[0];
          if (!value) return;

          await handler.execute(
            client,
            interaction,
            params,
            invokerId,
            value,
          );

          client.logger.info("Component handler completed", {
            handler: handlerName,
            user: interaction.user.id,
            guild: interaction.guildId,
            channel: interaction.channelId,
            duration: `${(performance.now() - start).toFixed(2)}ms`,
          });
        } catch (error) {
          client.logger.error("Error executing component handler", {
            error,
            handler: handlerName,
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
