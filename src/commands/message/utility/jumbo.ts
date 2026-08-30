import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { JumboResult } from "@/commands/shared/jumbo";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "jumbo",
  description: "Enlarge a custom emoji.",
  category: "Utility",
  aliases: ["enlarge", "bigemoji", "jumboemoji"],
  arguments: [
    {
      name: "emoji",
      aliases: ["e"],
      type: "string",
      description: "The emoji to enlarge.",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const raw = args.getString("emoji");

    if (!raw) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.jumbo.provide_emoji"))],
      });
      return;
    }

    try {
      const container = JumboResult(client, raw.trim(), message.guild);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to enlarge emoji", { error, raw });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.jumbo.fetch_error"))],
      });
    }
  },
});
