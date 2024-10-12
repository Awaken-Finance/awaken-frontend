import { gql } from '@apollo/client';
import { CmsStatusEnum } from 'graphqlServer/types/cms';
import { CMS_FILE_FRAGMENT, TCmsFile } from '../index';

export const ACTIVITY_BASE_FRAGMENT = gql`
  ${CMS_FILE_FRAGMENT}

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
    noticeImage {
      ...cmsFileFields
    }
    noticeMobileImage {
      ...cmsFileFields
    }
    noticeZhTwImage {
      ...cmsFileFields
    }
    noticeMobileZhTwImage {
      ...cmsFileFields
    }
    noticeBackgroundColor
    index
    isDev
    whitelist
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
  noticeImage?: TCmsFile;
  noticeMobileImage?: TCmsFile;
  noticeZhTwImage?: TCmsFile;
  noticeMobileZhTwImage?: TCmsFile;
  noticeBackgroundColor?: string;
  index: number;
  isDev: boolean;
  whitelist?: string[];
};
