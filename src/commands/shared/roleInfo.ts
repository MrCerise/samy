import { PermissionFlagsBits, type Role } from "discord.js";

import type Client from "@/classes/client";
import { Container, Text } from "@/ui/components";

const KEY_PERMISSIONS: [bigint, string][] = [
  [PermissionFlagsBits.Administrator, "Administrator"],
  [PermissionFlagsBits.ManageGuild, "Manage Server"],
  [PermissionFlagsBits.ManageRoles, "Manage Roles"],
  [PermissionFlagsBits.ManageChannels, "Manage Channels"],
  [PermissionFlagsBits.KickMembers, "Kick Members"],
  [PermissionFlagsBits.BanMembers, "Ban Members"],
  [PermissionFlagsBits.MentionEveryone, "Mention Everyone"],
];

export function RoleInfo(client: Client, role: Role) {
  const keyPerms = KEY_PERMISSIONS.filter(([bit]) =>
    role.permissions.has(bit),
  ).map(([, label]) => label);

  const container = new Container().text(
    Text(
      [
        `**${client.i18n.t("commands.roleinfo.title", { name: role.name })}**`,
        client.i18n.t("commands.roleinfo.details", {
          id: role.id,
          color: role.hexColor === "#000000" ? "Default" : role.hexColor,
          position: role.position,
          members: role.members.size.toLocaleString(),
          hoisted: role.hoist
            ? client.i18n.t("commands.roleinfo.yes")
            : client.i18n.t("commands.roleinfo.no"),
          mentionable: role.mentionable
            ? client.i18n.t("commands.roleinfo.yes")
            : client.i18n.t("commands.roleinfo.no"),
          managed: role.managed
            ? client.i18n.t("commands.roleinfo.yes")
            : client.i18n.t("commands.roleinfo.no"),
          created: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`,
        }),
        keyPerms.length > 0
          ? client.i18n.t("commands.roleinfo.key_permissions", {
              permissions: keyPerms.join(", "),
            })
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  );

  return container;
}
