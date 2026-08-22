import { MessageFlags } from "discord.js";

import Event from "@/classes/Event";
import { compileCv2Script } from "@/libs/scripting/cv2";
import { detectScriptKind } from "@/libs/scripting/detectScriptKind";
import { compileEmbedScript } from "@/libs/scripting/embed";
import { scheduleMessageDeletion } from "@/libs/scripting/scheduleMessageDeletion";
import { replaceVariables } from "@/libs/scripting/variables";

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

      const source = replaceVariables(welcome.message, {
        user: member.user,
        guild: member.guild,
      });

      let detected;
      try {
        detected = detectScriptKind(source);
      } catch (error) {
        client.logger.error("Failed to detect welcome script", {
          guild: member.guild.id,
          channel: welcome.channelId,
          error,
        });
        continue;
      }

      switch (detected.kind) {
        case "text": {
          const sent = await channel.send(detected.source);
          scheduleMessageDeletion(sent, detected.deleteMs);
          break;
        }

        case "embed": {
          if (!detected.source) continue;

          const compiled = compileEmbedScript(detected.source);

          if (!compiled.success) {
            client.logger.error("Failed to compile welcome embed", {
              guild: member.guild.id,
              channel: welcome.channelId,
              error: compiled.error,
            });

            continue;
          }

          const deleteMs = compiled.result.deleteMs ?? detected.deleteMs;

          const sent = await channel.send({
            ...(compiled.result.content
              ? {
                  content: compiled.result.content,
                }
              : {}),

            embeds: [compiled.result.embed],

            ...(compiled.result.components.length > 0
              ? {
                  components: compiled.result.components,
                }
              : {}),
          });

          scheduleMessageDeletion(sent, deleteMs);

          break;
        }

        case "cv2": {
          if (!detected.source) continue;

          const compiled = compileCv2Script(detected.source);

          if (!compiled.success) {
            client.logger.error("Failed to compile welcome CV2", {
              guild: member.guild.id,
              channel: welcome.channelId,
              error: compiled.error,
            });

            continue;
          }

          const deleteMs = compiled.result.deleteMs ?? detected.deleteMs;

          const sent = await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: compiled.result.components,
          });

          scheduleMessageDeletion(sent, deleteMs);

          break;
        }
      }
    }
  },
});
