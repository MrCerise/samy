import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { renderCasesList } from "@/ui/cases";

export default new ButtonHandler({
  namespace: "cases",
  action: "page",

  async execute(client, interaction, params, invokerId) {
    const guild = interaction.guild;
    if (!guild) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderCasesList(
      client,
      guild,
      invokerId,
      page,
      targetId,
    );

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
