export enum CmsStatusEnum {
  published = 'published',
  draft = 'draft',
}

export enum LanguagesCodeEnum {
  'en' = 'en',
  'zh_TW' = 'zh_TW',
}

export type TCmsTranslations = {
  languages_code: {
    code: LanguagesCodeEnum;
  };
} & Record<string, string>;
