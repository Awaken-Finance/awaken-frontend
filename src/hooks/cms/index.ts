import { TCmsFile } from 'graphqlServer';
import { LanguagesCodeEnum, TCmsTranslations } from 'graphqlServer/types/cms';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useCmsTranslations = <T extends Record<string, string | TCmsFile> = Record<string, string>>(
  list: TCmsTranslations[],
) => {
  const {
    i18n: { language },
  } = useTranslation();

  const languageMap = useMemo(
    () =>
      list.reduce<Record<LanguagesCodeEnum, Record<string, string>>>((pre, { languages_code, ...translations }) => {
        const { code } = languages_code || {};
        pre[code || ''] = translations;
        return pre;
      }, {} as any),
    [list],
  );

  return useCallback(
    (key: keyof T): string | undefined => {
      return languageMap[language as LanguagesCodeEnum]?.[key as string];
    },
    [language, languageMap],
  );
};

export const useGetCmsTranslations = () => {
  const {
    i18n: { language },
  } = useTranslation();

  return useCallback(
    <T extends Record<string, string> = Record<string, string>>(
      list: TCmsTranslations[],
      key: keyof T,
    ): string | undefined => {
      const translations = list.find((item) => item.languages_code.code === language);

      return translations?.[key as string];
    },
    [language],
  );
};
