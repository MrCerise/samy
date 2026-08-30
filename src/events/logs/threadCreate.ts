import Event from "@/classes/Event";
import { buildLogEntry } from "@/ui/logs";
import { sendLog } from "@/utils/logs/dispatch";

export default new Event({
  name: "threadCreate",

  async execute(client, thread) {
    if (!thread.guild) return;

    const container = buildLogEntry({
      category: "channels",
      title: "Thread created",
      description: `${thread.toString()} (\`${thread.name}\`)`,
      footer: `Thread ID: ${thread.id} • Type: ${thread.type}`,
    });

    await sendLog(client, {
      guildId: thread.guild.id,
      category: "channels",
      ignoreTargets: [thread.id, thread.parentId],
      container,
    });
  },
});
