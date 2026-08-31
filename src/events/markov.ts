import Event from "@/classes/Event";
import { getGuildPrefix, getUserPrefix } from "@/utils/settings";
import {
  isMarkovEnabled,
  learnMarkov,
  startMarkovFlush,
} from "@/utils/markov";

export default new Event({
  name: "messageCreate",

  async execute(client, message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.channel.isTextBased() || !("guild" in message.channel)) {
      return;
    }

    const content = message.content.trim();
    if (!content) return;

    // Skip messages that look like command invocations on any active prefix
    const [guildPrefix, userPrefix] = await Promise.all([
      getGuildPrefix(message.guild.id, client),
      getUserPrefix(message.author.id, client),
    ]);

    const prefixes = [userPrefix, guildPrefix, client.prefix].filter(
      (p): p is string => p !== null && p !== undefined && p.length > 0,
    );

    if (prefixes.some((p) => content.startsWith(p))) return;

    // Guild must have opted in
    const enabled = await isMarkovEnabled(message.guild.id, client);

    if (!enabled) return;

    await learnMarkov(client, message.guild.id, content);

    startMarkovFlush(client);
  },
});