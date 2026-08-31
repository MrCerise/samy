import { MessageFlags } from "discord.js";

import { MessageCommand, MessageSubcommand } from "@/classes/Command";
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

export default new MessageCommand({
  name: "markov",
  description: "Markov chain text generation.",
  category: "Fun",
  guildOnly: true,

  subcommands: [
    new MessageSubcommand({
      name: "generate",
      description: "Generate a Markov chain sentence.",
      aliases: ["gen", "g"],

      arguments: [
        {
          name: "word",
          description: "A seed word to start the sentence from.",
          aliases: ["w", "seed"],
          type: "string",
          required: false,
        },
        {
          name: "length",
          description: "Maximum number of words to generate.",
          aliases: ["l", "max"],
          type: "string",
          required: false,
        },
      ],

      async execute(client, message, args) {
        const seed = args.getString("word") ?? undefined;
        const rawLength = args.getString("length");
        const maxWords = rawLength ? Math.min(parseInt(rawLength, 10) || 25, 100) : 25;

        const chain = await getChain(client, message.guild!.id);

        if (!chain) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [MarkovNoChainError(client)],
          });
          return;
        }

        const sentence = generateMarkov(chain, seed, maxWords);

        if (!sentence) {
          if (seed) {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [MarkovSeedNotFoundError(client, seed)],
            });
          } else {
            await message.reply({
              flags: MessageFlags.IsComponentsV2,
              components: [MarkovNoChainError(client)],
            });
          }
          return;
        }

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [MarkovGenerateResult(client, sentence)],
        });
      },
    }),

    new MessageSubcommand({
      name: "enable",
      description: "Enable Markov chain learning for this server.",
      userPermissions: ["ManageGuild"],

      async execute(client, message) {
        const enabled = await isMarkovEnabled(message.guild!.id, client);

        if (enabled) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(client.i18n.t("commands.markov.already_enabled")),
              ),
            ],
          });
          return;
        }

        await setMarkovEnabled(message.guild!.id, true, client);

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(client.i18n.t("commands.markov.enabled")),
            ),
          ],
        });
      },
    }),

    new MessageSubcommand({
      name: "disable",
      description: "Disable Markov chain learning for this server.",
      userPermissions: ["ManageGuild"],

      async execute(client, message) {
        const enabled = await isMarkovEnabled(message.guild!.id, client);

        if (!enabled) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              new Container().text(
                Text(client.i18n.t("commands.markov.already_disabled")),
              ),
            ],
          });
          return;
        }

        await setMarkovEnabled(message.guild!.id, false, client);

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(client.i18n.t("commands.markov.disabled")),
            ),
          ],
        });
      },
    }),

    new MessageSubcommand({
      name: "reset",
      description: "Reset the Markov chain data for this server.",
      userPermissions: ["ManageGuild"],

      async execute(client, message) {
        await clearChain(client, message.guild!.id);

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new Container().text(
              Text(client.i18n.t("commands.markov.reset_done")),
            ),
          ],
        });
      },
    }),
  ],
});