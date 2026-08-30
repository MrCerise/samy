import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { EmojiInfo } from "@/commands/shared/emoji";
import errorUI from "@/ui/error";

export default new MessageCommand({
  name: "emojiinfo",
  description: "Get information about an emoji.",
  category: "Utility",
  aliases: ["ei", "emoji"],
  arguments: [
    {
      name: "emoji",
      description: "The emoji to get information about",
      aliases: ["e"],
      type: "string",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const raw = args.getString("emoji");

    if (!raw) {
      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [
          errorUI(client.i18n.t("commands.emojiinfo.provide_emoji")),
        ],
      });
      return;
    }

    try {
      const container = EmojiInfo(client, raw.trim(), message.guild);

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      });
    } catch (error) {
      client.logger.error("Failed to fetch emoji info", { error, raw });

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [errorUI(client.i18n.t("commands.emojiinfo.fetch_error"))],
      });
    }
  },
});
