import { type enTranslations } from "@/locales/en";

export type Dictionary = typeof enTranslations;

export function t(dictionary: Dictionary, key: keyof Dictionary) {
  return dictionary[key];
}

