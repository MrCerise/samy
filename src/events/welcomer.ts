import Event from "@/classes/Event";
import {
  deliverWelcomeMessage,
  welcomeFailureLogReason,
} from "@/commands/shared/welcomer";

export default new Event({
  name: "guildMemberAdd",

  async execute(client, member) {
    const welcomes = await client.prisma.welcome.findMany({
      where: {
        guildId: member.guild.id,
      },
    });

    if (!welcomes.length) return;

    for (const welcome of welcomes) {
      const channel = await member.guild.channels
        .fetch(welcome.channelId)
        .catch(() => null);

      if (!channel || !channel.isTextBased() || !("send" in channel)) {
        continue;
      }

      const result = await deliverWelcomeMessage(channel, welcome.message, {
        user: member.user,
        guild: member.guild,
        member,
      });

      if (!result.success) {
        client.logger.error("Failed to deliver welcome message", {
          guild: member.guild.id,
          channel: welcome.channelId,
          reason: welcomeFailureLogReason(result.failure),
          error: "error" in result.failure ? result.failure.error : undefined,
        });
      }
    }
  },
});
