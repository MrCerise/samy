import { MessageFlags } from "discord.js";

import { SelectHandler } from "@/classes/Interaction";
import { renderWarningDetail } from "@/ui/warnings";
import errorUI from "@/ui/error";

export default new SelectHandler({
  namespace: "warnings",
  action: "select",

  async execute(client, interaction, params, invokerId, value) {
    const guild = interaction.guild;
    if (!guild) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderWarningDetail(
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
        components: [errorUI(client.i18n.t("commands.warnings.not_found"))],
      });

      return;
    }

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
