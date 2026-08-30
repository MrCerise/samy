import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { buildBotListView } from "@/ui/botList";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "botlist",
  description: "List all bots in the server.",
  category: "Utility",
  aliases: ["bots"],
  guildOnly: true,

  async execute(client, message) {
    if (!message.guild) return;

    try {
      const container = buildBotListView(
        client,
        message.author.id,
        message.guild,
      );

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch bot list", {
        error,
        guild: message.guild.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.botlist.fetch_error"))],
      });
    }
  },
});
