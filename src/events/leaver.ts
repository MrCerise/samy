import Event from "@/classes/Event";
import {
  deliverLeaveMessage,
  leaveFailureLogReason,
} from "@/commands/shared/leaver";

export default new Event({
  name: "guildMemberRemove",

  async execute(client, member) {
    const leaves = await client.prisma.leave.findMany({
      where: {
        guildId: member.guild.id,
      },
    });

    if (!leaves.length) return;

    for (const leave of leaves) {
      const channel = await member.guild.channels
        .fetch(leave.channelId)
        .catch(() => null);

      if (!channel || !channel.isTextBased() || !("send" in channel)) {
        continue;
      }

      const result = await deliverLeaveMessage(channel, leave.message, {
        user: member.user,
        guild: member.guild,
        member,
      });

      if (!result.success) {
        client.logger.error("Failed to deliver leave message", {
          guild: member.guild.id,
          channel: leave.channelId,
          reason: leaveFailureLogReason(result.failure),
          error: "error" in result.failure ? result.failure.error : undefined,
        });
      }
    }
  },
});
