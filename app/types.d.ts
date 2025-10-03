import { enTranslations } from "@/locales/en";

declare global {
  interface Window {
    __translations__: typeof enTranslations;
  }
}

export {};

