import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, locales } from '@/utils/i18n/config';
import { getLocale } from '@/utils/i18n/locale';
import type { Locale } from '@/utils/i18n/types';

const i18nRequestConfig = getRequestConfig(async () => {
  const locale = (await getLocale()) as Locale;

  return {
    locale,
    messages:
      locale === defaultLocale || !locales.includes(locale)
        ? (await import(`@public/locales/${defaultLocale}.json`)).default
        : (await import(`@public/locales/${locale}.json`)).default,
  };
});

export default i18nRequestConfig;
