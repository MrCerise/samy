import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { SamyResult } from "@/commands/shared/samy";

export default new ButtonHandler({
  namespace: "samy",
  action: "again",
  invokerOnly: false,

  async execute(client, interaction) {
    const container = await SamyResult(
      client,
      interaction.user.id,
      interaction.user,
    );

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
