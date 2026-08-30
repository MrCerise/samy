import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { buildCategoryView } from "@/ui/help";
import errorUI from "@/ui/error";

export default new ButtonHandler({
  namespace: "help",
  action: "category",

  async execute(client, interaction, params, invokerId) {
    const [category, page] = params;

    if (!category) {
      return;
    }

    const container = buildCategoryView(
      client,
      invokerId,
      category,
      Number(page ?? 0),
    );

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
