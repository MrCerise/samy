import { MessageFlags } from "discord.js";

import { SelectHandler } from "@/classes/Interaction";
import { renderNoteDetail } from "@/ui/notes";
import errorUI from "@/ui/error";

export default new SelectHandler({
  namespace: "notes",
  action: "select",

  async execute(client, interaction, params, invokerId, value) {
    const guild = interaction.guild;
    if (!guild) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderNoteDetail(
      client,
      guild,
      invokerId,
      value,
      page,
      targetId,
    );

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(client.i18n.t("commands.notes.not_found"))],
      });

      return;
    }

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
