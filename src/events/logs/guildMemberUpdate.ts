import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "guildMemberUpdate",

  async execute(client, oldMember, newMember) {
    const guildId = newMember.guild.id;

    if (oldMember.nickname !== newMember.nickname) {
      const container = buildLogEntry({
        category: "members",
        title: "Nickname updated",
        thumbnail: newMember.displayAvatarURL(),
        description: `**${newMember.user.tag}** (<@${newMember.id}>)`,
        fields: [
          { name: "Before", value: oldMember.nickname ?? "*none*" },
          { name: "After", value: newMember.nickname ?? "*none*" },
        ],
        footer: `User ID: ${newMember.id}`,
      });

      await sendLog(client, {
        guildId,
        category: "members",
        ignoreTargets: [newMember.id],
        container,
      });
    }

    const addedRoles = newMember.roles.cache.filter(
      (role) => !oldMember.roles.cache.has(role.id),
    );
    const removedRoles = oldMember.roles.cache.filter(
      (role) => !newMember.roles.cache.has(role.id),
    );

    if (addedRoles.size === 0 && removedRoles.size === 0) return;

    const fields = [];

    if (addedRoles.size > 0) {
      fields.push({
        name: "Added",
        value: addedRoles.map((role) => `<@&${role.id}>`).join(", "),
      });
    }

    if (removedRoles.size > 0) {
      fields.push({
        name: "Removed",
        value: removedRoles.map((role) => `<@&${role.id}>`).join(", "),
      });
    }

    const container = buildLogEntry({
      category: "roles",
      title: "Roles updated",
      thumbnail: newMember.displayAvatarURL(),
      description: `**${newMember.user.tag}** (<@${newMember.id}>)`,
      fields,
      footer: `User ID: ${newMember.id}`,
    });

    await sendLog(client, {
      guildId,
      category: "roles",
      ignoreTargets: [
        newMember.id,
        ...addedRoles.map((role) => role.id),
        ...removedRoles.map((role) => role.id),
      ],
      container,
    });
  },
});
