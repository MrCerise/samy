import { MessageFlags } from "discord.js";

import { SelectHandler } from "@/classes/Interaction";
import { buildCategoryView } from "@/ui/help";
import errorUI from "@/ui/error";

export default new SelectHandler({
  namespace: "help",
  action: "categories",

  async execute(client, interaction, _params, invokerId, value) {
    const container = buildCategoryView(client, invokerId, value, 0);

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,

        components: [
          errorUI(
            client.i18n.t("commands.help.not_found", {
              command: "",
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
