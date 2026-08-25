import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { buildSubcommandView } from "@/ui/help";
import errorUI from "@/ui/error";

export default new ButtonHandler({
  namespace: "help",
  action: "subcommand",

  async execute(client, interaction, params, invokerId) {
    const [category, commandName, subName, categoryPage, subPage] = params;
    if (!category || !commandName || !subName) return;

    const container = buildSubcommandView(
      client,
      invokerId,
      category,
      commandName,
      subName.split(","),
      Number(categoryPage ?? 0),
      Number(subPage ?? 0),
    );

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(client.i18n.t("commands.help.not_found", { command: "" })),
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
