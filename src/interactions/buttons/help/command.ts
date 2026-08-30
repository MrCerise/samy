import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { buildCommandView } from "@/ui/help";
import errorUI from "@/ui/error";

export default new ButtonHandler({
  namespace: "help",
  action: "command",

  async execute(client, interaction, params, invokerId) {
    const [category, commandName, categoryPage, subPage] = params;

    if (!category || !commandName) {
      return;
    }

    const container = buildCommandView(
      client,
      invokerId,
      category,
      commandName,
      Number(categoryPage ?? 0),
      Number(subPage ?? 0),
    );

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,

        components: [
          errorUI(
            client.i18n.t("commands.help.not_found", {
              command: commandName,
            }),
          ),
        ],
      });

      return;
    }

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
