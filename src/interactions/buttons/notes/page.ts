import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { renderNotesList } from "@/ui/notes";

export default new ButtonHandler({
  namespace: "notes",
  action: "page",

  async execute(client, interaction, params, invokerId) {
    const guild = interaction.guild;
    if (!guild) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderNotesList(
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
