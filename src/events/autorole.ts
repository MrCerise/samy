import Event from "@/classes/Event";

export default new Event({
  name: "guildMemberAdd",

  async execute(client, member) {
    const autoroles = await client.prisma.autorole.findMany({
      where: {
        guildId: member.guild.id,
      },
    });

    if (!autoroles.length) return;

    const botMember = member.guild.members.me;
    if (!botMember) return;

    const validRoleIds: string[] = [];
    const invalidRoleIds: string[] = [];

    for (const autorole of autoroles) {
      const role = member.guild.roles.cache.get(autorole.roleId);

      if (!role) {
        invalidRoleIds.push(autorole.roleId);
        continue;
      }

      if (role.managed) {
        invalidRoleIds.push(autorole.roleId);
        continue;
      }

      if (role.position >= botMember.roles.highest.position) {
        client.logger.warn("Bot cannot assign autorole due to hierarchy", {
          guild: member.guild.id,
          role: role.id,
          rolePosition: role.position,
          botPosition: botMember.roles.highest.position,
        });
        continue;
      }

      validRoleIds.push(role.id);
    }

    if (invalidRoleIds.length > 0) {
      await client.prisma.autorole.deleteMany({
        where: {
          guildId: member.guild.id,
          roleId: { in: invalidRoleIds },
        },
      });
    }

    if (!validRoleIds.length) return;

    try {
      await member.roles.add(validRoleIds, "Autorole");
    } catch (error) {
      client.logger.error("Failed to assign autoroles", {
        guild: member.guild.id,
        user: member.id,
        roles: validRoleIds,
        error,
      });
    }
  },
});
