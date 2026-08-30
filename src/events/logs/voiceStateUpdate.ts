import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "voiceStateUpdate",

  async execute(client, oldState, newState) {
    if (!newState.guild) return;
    if (!newState.member || newState.member.user.bot) return;

    const member = newState.member;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (!oldChannel && !newChannel) return;

    const fields: { name: string; value: string }[] = [];

    if (oldChannel?.id !== newChannel?.id) {
      fields.push({
        name: "Channel",
        value: oldChannel
          ? oldChannel.toString()
          : "*Not in voice*",
      });
    }

    if (oldState.serverMute !== newState.serverMute) {
      fields.push({
        name: "Server muted",
        value: `${oldState.serverMute ? "Yes" : "No"} → ${newState.serverMute ? "Yes" : "No"}`,
      });
    }

    if (oldState.serverDeaf !== newState.serverDeaf) {
      fields.push({
        name: "Server deafened",
        value: `${oldState.serverDeaf ? "Yes" : "No"} → ${newState.serverDeaf ? "Yes" : "No"}`,
      });
    }

    if (oldState.selfMute !== newState.selfMute) {
      fields.push({
        name: "Self muted",
        value: `${oldState.selfMute ? "Yes" : "No"} → ${newState.selfMute ? "Yes" : "No"}`,
      });
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
      fields.push({
        name: "Self deafened",
        value: `${oldState.selfDeaf ? "Yes" : "No"} → ${newState.selfDeaf ? "Yes" : "No"}`,
      });
    }

    if (oldState.streaming !== newState.streaming && newState.streaming) {
      fields.push({ name: "Streaming", value: "Started streaming" });
    }

    if (oldState.selfVideo !== newState.selfVideo && newState.selfVideo) {
      fields.push({ name: "Video", value: "Camera turned on" });
    }

    if (fields.length === 0) return;

    const title =
      !oldChannel && newChannel
        ? "Joined voice channel"
        : oldChannel && !newChannel
          ? "Left voice channel"
          : "Voice state updated";

    const container = buildLogEntry({
      category: "voice",
      title,
      thumbnail: member.displayAvatarURL(),
      description: `**${member.user.tag}**`,
      fields,
      footer: `User ID: ${member.id}`,
    });

    await sendLog(client, {
      guildId: newState.guild.id,
      category: "voice",
      sourceChannelId: newChannel?.id,
      ignoreTargets: [member.id, newChannel?.id],
      container,
    });
  },
});
