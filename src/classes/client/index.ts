import * as Discord from "discord.js";
import { CheckEnvs } from "@/utils/env";
import { LoadEvents } from "../Event";
import Logger from "../Logger";
import {
  LoadCommands,
  type ContextCommand,
  type MessageCommand,
  type SlashCommand,
} from "../Command";
import {
  LoadInteractions,
  type ButtonHandler,
  type SelectHandler,
} from "../Interaction";
import { config } from "@/config/config";
import ClientLastFM from "./LastFm";
import prisma from "@/libs/prisma";
import { I18n } from "@/libs/i18n";
import type { AfkUser } from "@/types/afkUsers";

//@ts-ignore
Discord.DefaultWebSocketManagerOptions.identifyProperties.browser =
  config.presence.browser;

export default class Client extends Discord.Client {
  public config = config;
  public slashCommands = new Discord.Collection<string, SlashCommand>();
  public contextCommands = new Discord.Collection<string, ContextCommand>();
  public cooldowns = new Discord.Collection<string, number>(); // key is `CommandType:userid:commandName:subcommands`
  public messageCommands = new Discord.Collection<string, MessageCommand>();
  public buttonHandlers = new Discord.Collection<string, ButtonHandler>();
  public selectHandlers = new Discord.Collection<string, SelectHandler>();
  public afkUsers = new Discord.Collection<string, AfkUser>(); // key is `guildId:userId`
  public lastFm = new ClientLastFM();
  public prefix =
    process.env.NODE_ENV == "development" ? ",," : config.defaultPrefix;
  public prisma = prisma;
  public i18n = new I18n(prisma);
  constructor(public readonly logger = new Logger()) {
    super({
      intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: config.presence.status,
      },
    });
  }

  async connect() {
    CheckEnvs(["NODE_ENV", "DATABASE_URL"]);

    await this.i18n.load();

    await LoadEvents(this);

    await LoadCommands(this, "../../commands/slash", this.slashCommands);

    await LoadCommands(this, "../../commands/message", this.messageCommands);

    await LoadCommands(this, "../../commands/context", this.contextCommands);

    await LoadInteractions(
      this,
      "../../interactions/buttons",
      this.buttonHandlers,
    );

    await LoadInteractions(
      this,
      "../../interactions/selects",
      this.selectHandlers,
    );

    await this.login(process.env.DISCORD_TOKEN);
  }
}
