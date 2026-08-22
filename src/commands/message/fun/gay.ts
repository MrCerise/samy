import { MessageFlags } from "discord.js";

import { MessageCommand } from "@/classes/Command";
import { GayResult } from "@/commands/shared/gay";

export default new MessageCommand({
  name: "gay",
  description: "See how gay someone is.",
  category: "Fun",
  aliases: ["gayrate"],

  arguments: [
    {
      name: "user",
      description: "The user to check",
      aliases: ["u"],
      type: "user",
    },
  ],

  async execute(client, message, args) {
    const user = args.getUser("user") ?? message.author;

    await message.reply({
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: {
        users: [],
      },
      components: [GayResult(client, user)],
    });
  },
});
