import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { SamyResult } from "@/commands/shared/samy";

export default new ButtonHandler({
  namespace: "samy",
  action: "again",

  async execute(client, interaction) {
    const container = await SamyResult(client, interaction.user.id);

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
