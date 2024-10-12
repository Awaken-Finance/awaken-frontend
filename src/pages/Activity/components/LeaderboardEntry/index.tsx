import { ILeaderboardEntryActivity } from 'utils/activity';
import './styles.less';
import { S3Image } from 'components/S3Image';
import { useCmsTranslations, useGetCmsTranslations } from 'hooks/cms';
import { TLeaderboardEntryInfoTranslations } from 'graphqlServer/queries/activity/leaderboardEntry';
import { LeaderboardEntrySub } from './components/LeaderboardEntrySub';
import { useMobile } from 'utils/isMobile';
import { ActivityRichText } from '../common/ActivityRichText';
import { useCallback, useEffect } from 'react';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';

export type TLeaderboardEntryProps = {
  activity: ILeaderboardEntryActivity;
};

const OFFSET_TOP = 140;
const MOBILE_OFFSET_TOP = 60;

export const LeaderboardEntry = ({ activity }: TLeaderboardEntryProps) => {
  const t = useCmsTranslations<TLeaderboardEntryInfoTranslations>(activity.info.translations);
  const getCmsTranslations = useGetCmsTranslations();
  const isMobile = useMobile();

  const onRouteClick = useCallback(
    (idx: number) => {
      const elements = document.getElementsByClassName('leaderboard-entry-sub');

      const element = elements[idx];
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const absoluteElementTop = rect.top + window.scrollY - (isMobile ? MOBILE_OFFSET_TOP : OFFSET_TOP);

      window.scrollTo({
        top: absoluteElementTop,
        behavior: 'smooth',
      });
    },
    [isMobile],
  );

  useEffect(() => {
    let stickyElement = document.querySelector('.leaderboard-entry-sub-route');
    let subElements = document.getElementsByClassName('leaderboard-entry-sub');
    let routeItemElements = document.getElementsByClassName('leaderboard-entry-sub-route-item');

    const handleScroll = () => {
      if (!stickyElement) {
        stickyElement = document.querySelector('.leaderboard-entry-sub-route') as Element;
      }
      if (!subElements || subElements.length <= 0) {
        subElements = document.getElementsByClassName('leaderboard-entry-sub');
      }
      if (!routeItemElements || routeItemElements.length <= 0) {
        routeItemElements = document.getElementsByClassName('leaderboard-entry-sub-route-item');
      }

      const rect = stickyElement.getBoundingClientRect();
      if (rect.top <= 60) {
        stickyElement.classList.add('sticky-active');
      } else {
        stickyElement.classList.remove('sticky-active');
      }
      const boundary = rect.height + rect.top;

      let index = undefined;
      for (let i = 0; i < subElements.length; i++) {
        const element = subElements[i];
        const elementRect = element.getBoundingClientRect();
        if (elementRect.top + elementRect.height >= boundary) {
          index = i;
          break;
        }
      }
      if (index === undefined) index = subElements.length - 1;

      for (let i = 0; i < routeItemElements.length; i++) {
        const element = routeItemElements[i];
        if (i === index) element.classList.add('leaderboard-entry-sub-route-item-active');
        else element.classList.remove('leaderboard-entry-sub-route-item-active');
      }
    };

    handleScroll();
    const timer = setTimeout(() => {
      handleScroll();
    }, 500);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      timer && clearTimeout(timer);
    };
  }, []);

  return (
    <div className="leaderboard-entry-page" style={{ backgroundColor: activity.info.backgroundColor }}>
      <div className="leaderboard-image-wrap">
        {activity.info.backgroundImage && (
          <S3Image className="leaderboard-background-image" uri={activity.info.backgroundImage?.filename_disk} />
        )}
        {activity.info.decorativeImage && (
          <S3Image className="leaderboard-decorative-image" uri={activity.info.decorativeImage?.filename_disk} />
        )}
      </div>

      <div className="leaderboard-entry-content">
        <div className="leaderboard-entry-hero-section">
          {!isMobile && <S3Image className="leaderboard-main-image" uri={activity.info.mainImage?.filename_disk} />}

          <div className="leaderboard-entry-hero-section-content">
            <div className="leaderboard-entry-hero-section-tip">{t('labelTag')}</div>
            <div className="leaderboard-entry-hero-section-title">{t('title')}</div>

            {t('description') && (
              <ActivityRichText
                className="leaderboard-entry-hero-section-description"
                innerHTML={t('description') || ''}
              />
            )}
          </div>
        </div>

        <div className="leaderboard-entry-sub-route" id="leaderboard-entry-sub-route">
          <div className="leaderboard-entry-sub-route-content">
            {activity.info.children.map((item, idx) => (
              <div
                className="leaderboard-entry-sub-route-item"
                key={item.id}
                onClick={() => {
                  onRouteClick(idx);
                }}>
                <div className="leaderboard-entry-sub-route-item-content">
                  {getCmsTranslations<TLeaderboardInfoTranslations>(
                    activity.info.children[idx].info.translations,
                    'activityName',
                  )}
                </div>
                <div className="leaderboard-entry-sub-route-item-bottom"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="leaderboard-entry-sub-section">
          {activity.info.children.map((item) => (
            <LeaderboardEntrySub key={item.id} activity={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
