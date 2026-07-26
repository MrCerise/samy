import { LEADING_CHANNEL_MENTION } from "@/utils/constants";
import { MessageCommand } from "../../../classes/Command";

export default new MessageCommand({
  name: "say",
  description: "Sends a message to a channel as the bot.",
  category: "Moderation",
  guildOnly: true,

  arguments: [
    {
      name: "message",
      aliases: ["m"],
      type: "string",
      description:
        "The message to send. Optionally start with a #channel mention to target a specific channel.",
      required: true,
    },
  ],

  async execute(client, message, args) {
    const raw = args.getString("message")!;

    let channel = message.channel;
    let content = raw;

    const mentionMatch = raw.match(LEADING_CHANNEL_MENTION);

    if (mentionMatch) {
      const channelId = mentionMatch[1]!;
      const targetChannel =
        message.guild?.channels.cache.get(channelId) ??
        (await message.guild?.channels.fetch(channelId).catch(() => null));

      if (!targetChannel) {
        await message.reply(
          `I couldn't find a channel with ID "${channelId}".`,
        );
        return;
      }

      channel = targetChannel as typeof message.channel;
      content = raw.slice(mentionMatch[0].length);
    }

    if (!content.trim()) {
      await message.reply("You need to provide a message to send.");
      return;
    }

    if (!channel.isTextBased() || !("send" in channel)) {
      await message.reply("I can't send messages in that channel.");
      return;
    }

    await channel.send(content);
  },
});
