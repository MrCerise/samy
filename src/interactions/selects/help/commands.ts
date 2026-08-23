import { MessageFlags } from "discord.js";

import { SelectHandler } from "@/classes/Interaction";
import { buildCommandView } from "@/ui/help";
import errorUI from "@/ui/error";

export default new SelectHandler({
  namespace: "help",
  action: "commands",

  async execute(client, interaction, params, invokerId, value) {
    const [category, page] = params;
    if (!category) return;

    const container = buildCommandView(
      client,
      invokerId,
      category,
      value,
      Number(page ?? 0),
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
