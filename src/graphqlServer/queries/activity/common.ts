import { gql } from '@apollo/client';
import { CmsStatusEnum, TCmsTranslations } from 'graphqlServer/types/cms';
import { CMS_FILE_FRAGMENT, TCmsFile } from '../index';

export const ACTIVITY_BASE_TRANSLATIONS_FRAGMENT = gql`
  ${CMS_FILE_FRAGMENT}

  fragment activityListTranslationsFields on activityList_translations {
    languages_code {
      code
    }
    noticeImage {
      ...cmsFileFields
    }
    noticeMobileImage {
      ...cmsFileFields
    }
  }
`;

export type TActivityListTranslations = {
  noticeImage?: TCmsFile;
  noticeMobileImage?: TCmsFile;
};

export const ACTIVITY_BASE_FRAGMENT = gql`
  ${ACTIVITY_BASE_TRANSLATIONS_FRAGMENT}

  fragment activityBaseFields on activityList {
    id
    pageId
    serviceId
    status
    startTime
    endTime
    publishTime
    unpublishTime
    isMain
    noticeBackgroundColor
    index
    isDev
    whitelist
    translations {
      ...activityListTranslationsFields
    }
  }
`;

export type TActivityBase = {
  id: string;
  pageId: string;
  serviceId?: string;
  status: CmsStatusEnum;
  startTime: string;
  endTime: string;
  publishTime: string;
  unpublishTime: string;
  isMain: boolean;
  noticeBackgroundColor?: string;
  index: number;
  isDev: boolean;
  whitelist?: string[];
  translations: (TCmsTranslations & TActivityListTranslations)[];
};
