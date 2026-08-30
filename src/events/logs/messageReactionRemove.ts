import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "messageReactionRemove",

  async execute(client, reaction, user) {
    if (user.bot) return;
    if (!reaction.message.guild) return;
    if (reaction.partial || reaction.message.partial) return;

    const container = buildLogEntry({
      category: "images",
      title: "Reaction removed",
      thumbnail: user.displayAvatarURL(),
      description: `**${user.tag}** removed ${reaction.emoji.toString()} from <#${reaction.message.channelId}>`,
      footer: `User ID: ${user.id} • Message ID: ${reaction.message.id}`,
    });

    await sendLog(client, {
      guildId: reaction.message.guild.id,
      category: "images",
      sourceChannelId: reaction.message.channelId,
      ignoreTargets: [user.id, reaction.message.channelId],
      container,
    });
  },
});
