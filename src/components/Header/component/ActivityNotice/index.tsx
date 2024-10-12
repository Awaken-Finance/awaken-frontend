import clsx from 'clsx';
import { S3Image } from 'components/S3Image';
import { TActivityBase } from 'graphqlServer/queries/activity/common';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './styles.less';
import { useMobile } from 'utils/isMobile';
import { useLanguage } from 'i18n';

export type TActivityNoticeProps = {
  activity?: TActivityBase;
};
export const ActivityNotice = ({ activity }: TActivityNoticeProps) => {
  const isMobile = useMobile();
  const history = useHistory();
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const onActivityNoticeClick = useCallback(() => {
    history.push(`/activity/${activity?.pageId || ''}`);
  }, [activity?.pageId, history]);

  const isActivityNoticeHide = useMemo(() => pathname.startsWith('/activity'), [pathname]);

  const imgUrl = useMemo(() => {
    if (isMobile) {
      if (language === 'zh_TW')
        return activity?.noticeMobileZhTwImage?.filename_disk || activity?.noticeMobileImage?.filename_disk;
      else return activity?.noticeMobileImage?.filename_disk;
    } else {
      if (language === 'zh_TW') return activity?.noticeZhTwImage?.filename_disk || activity?.noticeImage?.filename_disk;
      else return activity?.noticeImage?.filename_disk;
    }
  }, [
    activity?.noticeImage?.filename_disk,
    activity?.noticeMobileImage?.filename_disk,
    activity?.noticeMobileZhTwImage?.filename_disk,
    activity?.noticeZhTwImage?.filename_disk,
    isMobile,
    language,
  ]);

  if (!activity) return <></>;

  return (
    <div
      className={clsx(['activity-site-header-content', isActivityNoticeHide && 'activity-site-header-content-hidden'])}
      onClick={onActivityNoticeClick}
      style={{ backgroundColor: activity?.noticeBackgroundColor || 'transparent' }}>
      <S3Image uri={imgUrl || ''} />
    </div>
  );
};
