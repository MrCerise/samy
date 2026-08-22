import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { MemberCount } from "@/commands/shared/memberCount";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "membercount",
  description: "View this server's member count",
  category: "Utility",
  aliases: ["mc"],
  guildOnly: true,

  async execute(client, message) {
    if (!message.guild) return;

    try {
      const container = MemberCount(client, message.guild);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch member count", {
        error,
        guild: message.guild.id,
      });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(client.i18n.t("commands.membercount.fetch_error")),
        ],
      });
    }
  },
});
