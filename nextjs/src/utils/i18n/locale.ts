'use server';

import { cookies } from 'next/headers';

import { defaultLocale } from '@/utils/i18n/config';
import type { Locale } from '@/utils/i18n/types';

const COOKIE_NAME = 'NEXT_LOCALE';

const getLocale = async () => {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
};

const setLocale = async (locale?: string) => {
  (await cookies()).set(COOKIE_NAME, (locale as Locale) || defaultLocale);
};

export { getLocale, setLocale };
