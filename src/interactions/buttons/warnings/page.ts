import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { renderWarningsList } from "@/ui/warnings";

export default new ButtonHandler({
  namespace: "warnings",
  action: "page",

  async execute(client, interaction, params, invokerId) {
    const guild = interaction.guild;
    if (!guild) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderWarningsList(
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
