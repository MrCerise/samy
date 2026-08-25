import { MessageFlags } from "discord.js";

import { SelectHandler } from "@/classes/Interaction";
import { renderCaseDetail } from "@/ui/cases";
import errorUI from "@/ui/error";

export default new SelectHandler({
  namespace: "cases",
  action: "select",

  async execute(client, interaction, params, invokerId, value) {
    const guild = interaction.guild;
    if (!guild) return;

    const caseNumber = Number(value);
    if (!Number.isInteger(caseNumber)) return;

    const page = Number(params[0] ?? 0);
    const targetId = params[1];

    const container = await renderCaseDetail(
      client,
      guild,
      invokerId,
      caseNumber,
      page,
      targetId,
    );

    if (!container) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [
          errorUI(
            client.i18n.t("commands.cases.not_found", { case: value }),
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
