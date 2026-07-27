import { TranslationLoader } from "./loader";
import { DEFAULT_LOCALE, translate } from "./translator";
import type {
  LocaleResolutionOptions,
  TranslationDictionary,
  TranslationVariables,
} from "./types";

export { TranslationLoader } from "./loader";
export { DEFAULT_LOCALE } from "./translator";
export type {
  LocaleIdentifier,
  LocaleResolutionOptions,
  TranslationDictionary,
  TranslationValue,
  TranslationVariables,
} from "./types";

export class I18n {
  private readonly loader = new TranslationLoader();
  private translations?: ReadonlyMap<string, TranslationDictionary>;

  async load(): Promise<void> {
    this.translations = await this.loader.load();
  }

  t(locale: string, key: string, variables?: TranslationVariables): string {
    return translate(this.translations ?? new Map(), locale, key, variables);
  }
}

export function resolveLocale({
  userLocale,
  guildLocale,
  interactionLocale,
}: LocaleResolutionOptions): string {
  return userLocale || guildLocale || interactionLocale || DEFAULT_LOCALE;
}
