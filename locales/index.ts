import { enTranslations } from "./en";

const dictionaries = {
  en: enTranslations,
};

type Locale = keyof typeof dictionaries;

export async function getDictionary(locale: Locale = "en") {
  return dictionaries[locale];
}

