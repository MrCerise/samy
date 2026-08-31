import {
  ApplicationIntegrationType,
  InteractionContextType,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

import { SlashCommand } from "@/classes/Command";
import { Container, Text } from "@/ui/components";
import {
  isMarkovEnabled,
  setMarkovEnabled,
  getChain,
  generateMarkov,
  clearChain,
} from "@/utils/markov";
import {
  MarkovGenerateResult,
  MarkovNoChainError,
  MarkovSeedNotFoundError,
} from "@/commands/shared/markov";
import errorUI from "@/ui/error";

export default new SlashCommand({
  data: new SlashCommandBuilder()
    .setName("markov")
    .setDescription("Markov chain text generation.")
    .addSubcommand((sub) =>
      sub
        .setName("generate")
        .setDescription("Generate a Markov chain sentence.")
        .addStringOption((option) =>
          option
            .setName("word")
            .setDescription("A seed word to start the sentence from.")
            .setRequired(false),
        )
        .addIntegerOption((option) =>
          option
            .setName("length")
            .setDescription("Maximum number of words to generate (max 100).")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("enable")
        .setDescription("Enable Markov chain learning for this server."),
    )
    .addSubcommand((sub) =>
      sub
        .setName("disable")
        .setDescription("Disable Markov chain learning for this server."),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription("Reset the Markov chain data for this server."),
    )
    .setIntegrationTypes(
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    )
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ),

  category: "Fun",

  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("errors.guild_only"))],
      });
      return;
    }

    if (subcommand === "generate") {
      const seed = interaction.options.getString("word") ?? undefined;
      const maxWords = interaction.options.getInteger("length") ?? 25;

      const chain = await getChain(client, guildId);

      if (!chain) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [MarkovNoChainError(client)],
        });
        return;
      }

      const sentence = generateMarkov(chain, seed, maxWords);

      if (!sentence) {
        if (seed) {
          await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [MarkovSeedNotFoundError(client, seed)],
          });
        } else {
          await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [MarkovNoChainError(client)],
          });
        }
        return;
      }

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [MarkovGenerateResult(client, sentence)],
      });
      return;
    }

    if (subcommand === "enable") {
      const enabled = await isMarkovEnabled(guildId, client);

      if (enabled) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(client.i18n.t("commands.markov.already_enabled")),
            ),
          ],
        });
        return;
      }

      await setMarkovEnabled(guildId, true, client);

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(client.i18n.t("commands.markov.enabled")),
          ),
        ],
      });
      return;
    }

    if (subcommand === "disable") {
      const enabled = await isMarkovEnabled(guildId, client);

      if (!enabled) {
        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(client.i18n.t("commands.markov.already_disabled")),
            ),
          ],
        });
        return;
      }

      await setMarkovEnabled(guildId, false, client);

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(client.i18n.t("commands.markov.disabled")),
          ),
        ],
      });
      return;
    }

    if (subcommand === "reset") {
      await clearChain(client, guildId);

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          new Container().text(
            Text(client.i18n.t("commands.markov.reset_done")),
          ),
        ],
      });
      return;
    }
  },
});