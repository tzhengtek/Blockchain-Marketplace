import { Locale } from '@/utils/i18n/types';

export const defaultLocale = 'en';

export const timeZone = 'Europe/Amsterdam';

export const locales = [defaultLocale, 'ru', 'fr', 'cn'] as const;

export const localesMap: Record<Locale, { name: string; flag: string }> = {
  en: { name: 'English', flag: 'US' },
  ru: { name: 'Русский', flag: 'RU' },
  fr: { name: 'Français', flag: 'FR' },
  cn: { name: '简体中文', flag: 'CN' },
};
