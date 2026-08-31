import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "guildUpdate",

  async execute(client, oldGuild, newGuild) {
    const fields: { name: string; value: string }[] = [];

    if (oldGuild.name !== newGuild.name) {
      fields.push({
        name: "Name",
        value: `\`${oldGuild.name}\` → \`${newGuild.name}\``,
      });
    }

    if (oldGuild.description !== newGuild.description) {
      fields.push({
        name: "Description",
        value: `\`${oldGuild.description ?? "none"}\` → \`${newGuild.description ?? "none"}\``,
      });
    }

    if (oldGuild.afkChannelId !== newGuild.afkChannelId) {
      fields.push({
        name: "AFK channel",
        value: oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` : "*none*",
      });
    }

    if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
      fields.push({
        name: "AFK timeout",
        value: `${oldGuild.afkTimeout}s → ${newGuild.afkTimeout}s`,
      });
    }

    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      fields.push({
        name: "Verification level",
        value: `${oldGuild.verificationLevel} → ${newGuild.verificationLevel}`,
      });
    }

    if (
      oldGuild.defaultMessageNotifications !==
      newGuild.defaultMessageNotifications
    ) {
      fields.push({
        name: "Default notifications",
        value: `${oldGuild.defaultMessageNotifications} → ${newGuild.defaultMessageNotifications}`,
      });
    }

    if (oldGuild.explicitContentFilter !== newGuild.explicitContentFilter) {
      fields.push({
        name: "Explicit content filter",
        value: `${oldGuild.explicitContentFilter} → ${newGuild.explicitContentFilter}`,
      });
    }

    if (fields.length === 0) return;

    const container = buildLogEntry({
      category: "guild",
      title: "Guild updated",
      description: newGuild.name,
      fields,
      footer: `Guild ID: ${newGuild.id}`,
    });

    await sendLog(client, {
      guildId: newGuild.id,
      category: "guild",
      container,
    });
  },
});
