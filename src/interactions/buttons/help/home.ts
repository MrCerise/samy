import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { buildOverview } from "@/ui/help";

export default new ButtonHandler({
  namespace: "help",
  action: "home",

  async execute(client, interaction, params, invokerId) {
    const page = Number(params[0] ?? 0);
    const container = buildOverview(client, invokerId, page);

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
