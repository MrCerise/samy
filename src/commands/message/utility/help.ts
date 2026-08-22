import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { buildCommandView, buildOverview } from "@/ui/help";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "help",
  description: "Browse commands or get details about a specific one",
  category: "Utility",
  aliases: ["h", "commands"],
  arguments: [
    {
      name: "command",
      aliases: ["c"],
      type: "string",
      description: "The command to get more information about",
      required: false,
    },
  ],

  async execute(client, message, args) {
    try {
      const query = args.getString("command")?.toLowerCase();

      if (query) {
        const command =
          client.messageCommands.get(query) ??
          client.messageCommands.find((cmd) => cmd.aliases.includes(query));

        if (!command) {
          await message.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [
              errorUI(
                client.i18n.t("commands.help.not_found", { command: query }),
              ),
            ],
          });
          return;
        }

        const category = command.options.category ?? "Uncategorized";
        const container = buildCommandView(
          client,
          message.author.id,
          category,
          command.name,
        );

        if (!container) return;

        await message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [container],
        });
        return;
      }

      const container = buildOverview(client, message.author.id);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to build help menu", {
        error,
        user: message.author.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.help.fetch_error"))],
      });
    }
  },
});
