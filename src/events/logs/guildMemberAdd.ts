import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

const NEW_ACCOUNT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export default new Event({
  name: "guildMemberAdd",

  async execute(client, member) {
    const accountAge = Date.now() - member.user.createdTimestamp;
    const isNewAccount = accountAge < NEW_ACCOUNT_THRESHOLD_MS;

    const container = buildLogEntry({
      category: "members",
      title: "Member joined",
      thumbnail: member.displayAvatarURL(),
      description: `**${member.user.tag}** (<@${member.id}>)`,
      fields: [
        {
          name: "Account created",
          value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>${
            isNewAccount ? " ⚠️ New account" : ""
          }`,
        },
      ],
      footer: `User ID: ${member.id}`,
    });

    await sendLog(client, {
      guildId: member.guild.id,
      category: "members",
      ignoreTargets: [member.id],
      container,
    });
  },
});
