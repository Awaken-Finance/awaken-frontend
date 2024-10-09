import { gql } from '@apollo/client';
import { CmsStatusEnum } from 'graphqlServer/types/cms';

export const ACTIVITY_BASE_FRAGMENT = gql`
  fragment activityBaseFields on activityList {
    id
    status
    startTime
    endTime
    publishTime
    unpublishTime
    isMain
    index
    isDev
    whitelist
  }
`;

export type TActivityBase = {
  id: string;
  status: CmsStatusEnum;
  startTime: string;
  endTime: string;
  publishTime: string;
  unpublishTime: string;
  isMain: boolean;
  index: number;
  isDev: boolean;
  whitelist?: string[];
};
