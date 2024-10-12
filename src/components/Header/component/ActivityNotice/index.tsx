import clsx from 'clsx';
import { S3Image } from 'components/S3Image';
import { TActivityBase } from 'graphqlServer/queries/activity/common';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './styles.less';
import { useMobile } from 'utils/isMobile';

export type TActivityNoticeProps = {
  activity?: TActivityBase;
};
export const ActivityNotice = ({ activity }: TActivityNoticeProps) => {
  const isMobile = useMobile();
  const history = useHistory();
  const { pathname } = useLocation();
  const onActivityNoticeClick = useCallback(() => {
    history.push(`/activity/${activity?.pageId || ''}`);
  }, [activity?.pageId, history]);

  const isActivityNoticeHide = useMemo(() => pathname.startsWith('/activity'), [pathname]);

  if (!activity) return <></>;

  return (
    <div
      className={clsx(['activity-site-header-content', isActivityNoticeHide && 'activity-site-header-content-hidden'])}
      onClick={onActivityNoticeClick}
      style={{ backgroundColor: activity?.noticeBackgroundColor || 'transparent' }}>
      <S3Image
        uri={isMobile ? activity?.noticeMobileImage?.filename_disk || '' : activity?.noticeImage?.filename_disk || ''}
      />
    </div>
  );
};
