import { MessageFlags } from "discord.js";

import { ButtonHandler } from "@/classes/Interaction";
import { buildBotListView } from "@/ui/botList";

export default new ButtonHandler({
  namespace: "botlist",
  action: "page",
  guildOnly: true,

  async execute(client, interaction, params) {
    if (!interaction.guild) return;

    const page = Number(params[0] ?? 0);
    const container = buildBotListView(
      client,
      interaction.user.id,
      interaction.guild,
      page,
    );

    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  },
});
