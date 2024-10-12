import clsx from 'clsx';
import { S3Image } from 'components/S3Image';
import { TActivityBase, TActivityListTranslations } from 'graphqlServer/queries/activity/common';
import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './styles.less';
import { useMobile } from 'utils/isMobile';
import { useCmsTranslations } from 'hooks/cms';
import { TCmsFile } from 'graphqlServer';

export type TActivityNoticeProps = {
  activity?: TActivityBase;
};
export const ActivityNotice = ({ activity }: TActivityNoticeProps) => {
  const isMobile = useMobile();
  const history = useHistory();
  const { pathname } = useLocation();
  const t = useCmsTranslations<TActivityListTranslations>(activity?.translations || []);

  const onActivityNoticeClick = useCallback(() => {
    history.push(`/activity/${activity?.pageId || ''}`);
  }, [activity?.pageId, history]);

  const isActivityNoticeHide = useMemo(() => pathname.startsWith('/activity'), [pathname]);

  const imgUrl = useMemo(() => {
    return isMobile
      ? (t('noticeMobileImage') as unknown as TCmsFile)?.filename_disk
      : (t('noticeImage') as unknown as TCmsFile)?.filename_disk;
  }, [isMobile, t]);

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
