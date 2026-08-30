import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { ServerInfo } from "@/commands/shared/serverInfo";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "serverinfo",
  description: "Get information about the server.",
  category: "Utility",
  aliases: ["si", "guildinfo"],
  guildOnly: true,

  async execute(client, message) {
    if (!message.guild) return;

    try {
      const containers = await ServerInfo(client, message.guild);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: containers,
      });
    } catch (error) {
      client.logger.error("Failed to fetch server info", {
        error,
        guild: message.guild.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.serverinfo.fetch_error"))],
      });
    }
  },
});
