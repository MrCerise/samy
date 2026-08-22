import { MessageFlags } from "discord.js";

import Event from "@/classes/Event";
import { buildBotListView } from "@/ui/botList";
import errorUI from "@/ui/error";

export default new Event({
  name: "interactionCreate",

  async execute(client, interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("botlist::")) return;
    if (!interaction.guild) return;

    const [, action, page, invokerId] = interaction.customId.split("::");

    if (!action || !invokerId) return;

    if (interaction.user.id !== invokerId) {
      await interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [errorUI(client.i18n.t("errors.not_your_menu"))],
      });
      return;
    }

    if (action === "noop") return;
    if (action !== "page") return;

    const container = buildBotListView(
      client,
      invokerId,
      interaction.guild,
      Number(page ?? 0),
    );

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
