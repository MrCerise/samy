import { AsyncLocalStorage } from "node:async_hooks";

import type { PrismaClient } from "@prisma/client";

import { TranslationLoader } from "./loader";
import { DEFAULT_LOCALE, translate } from "./translator";

import type {
  LocaleResolutionOptions,
  StoredLocaleResolutionOptions,
  TranslationDictionary,
  TranslationVariables,
} from "./types";

export { TranslationLoader } from "./loader";
export { DEFAULT_LOCALE } from "./translator";

export type {
  LocaleIdentifier,
  LocaleResolutionOptions,
  StoredLocaleResolutionOptions,
  TranslationDictionary,
  TranslationValue,
  TranslationVariables,
} from "./types";

export class I18n {
  private readonly loader = new TranslationLoader();

  private translations?: ReadonlyMap<string, TranslationDictionary>;

  private readonly userLocales = new Map<string, string | null>();
  private readonly guildLocales = new Map<string, string | null>();

  private readonly localeContext = new AsyncLocalStorage<string>();

  constructor(private readonly prisma: PrismaClient) {}

  async load(): Promise<void> {
    this.translations = await this.loader.load();
  }

  t(key: string, variables?: TranslationVariables): string {
    return translate(this.dictionaries, this.currentLocale(), key, variables);
  }

  async withResolvedLocale<T>(
    options: StoredLocaleResolutionOptions,
    callback: () => Promise<T>,
  ): Promise<T> {
    const locale = await this.resolveLocale(options);

    return this.withLocale(locale, callback);
  }

  withLocale<T>(locale: string, callback: () => T): T {
    return this.localeContext.run(locale, callback);
  }

  currentLocale(): string {
    return this.localeContext.getStore() ?? DEFAULT_LOCALE;
  }

  availableLocales(): string[] {
    return Array.from(this.dictionaries.keys());
  }

  async resolveLocale({
    userId,
    guildId,
    interactionLocale,
  }: StoredLocaleResolutionOptions): Promise<string> {
    const [userLocale, guildLocale] = await Promise.all([
      userId ? this.getUserLocale(userId) : null,
      guildId ? this.getGuildLocale(guildId) : null,
    ]);

    const locale = resolveLocale({
      userLocale,
      guildLocale,
      interactionLocale,
    });

    return this.dictionaries.has(locale) ? locale : DEFAULT_LOCALE;
  }

  invalidateUserLocale(userId: string): void {
    this.userLocales.delete(userId);
  }

  invalidateGuildLocale(guildId: string): void {
    this.guildLocales.delete(guildId);
  }

  private get dictionaries(): ReadonlyMap<string, TranslationDictionary> {
    if (!this.translations) {
      throw new Error("Translations have not been loaded.");
    }

    return this.translations;
  }

  private async getUserLocale(userId: string): Promise<string | null> {
    if (this.userLocales.has(userId)) {
      return this.userLocales.get(userId) ?? null;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        locale: true,
      },
    });

    const locale = user?.locale ?? null;

    this.userLocales.set(userId, locale);

    return locale;
  }

  private async getGuildLocale(guildId: string): Promise<string | null> {
    if (this.guildLocales.has(guildId)) {
      return this.guildLocales.get(guildId) ?? null;
    }

    const guild = await this.prisma.guild.findUnique({
      where: {
        id: guildId,
      },
      select: {
        locale: true,
      },
    });

    const locale = guild?.locale ?? null;

    this.guildLocales.set(guildId, locale);

    return locale;
  }
}

export function resolveLocale({
  userLocale,
  guildLocale,
  interactionLocale,
}: LocaleResolutionOptions): string {
  return userLocale ?? guildLocale ?? interactionLocale ?? DEFAULT_LOCALE;
}
