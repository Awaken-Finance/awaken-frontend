import { ILeaderboardEntryActivity } from 'utils/activity';
import './styles.less';
import { S3Image } from 'components/S3Image';
import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardEntryInfoTranslations } from 'graphqlServer/queries/activity/leaderboardEntry';
import { LeaderboardEntrySub } from './components/LeaderboardEntrySub';
import { useMobile } from 'utils/isMobile';

export type TLeaderboardEntryProps = {
  activity: ILeaderboardEntryActivity;
};

export const LeaderboardEntry = ({ activity }: TLeaderboardEntryProps) => {
  const t = useCmsTranslations<TLeaderboardEntryInfoTranslations>(activity.info.translations);
  const isMobile = useMobile();

  return (
    <div className="leaderboard-entry-page" style={{ backgroundColor: activity.info.backgroundColor }}>
      {activity.info.backgroundImage && (
        <S3Image className="leaderboard-background-image" uri={activity.info.backgroundImage?.filename_disk} />
      )}
      {activity.info.decorativeImage && (
        <S3Image className="leaderboard-decorative-image" uri={activity.info.decorativeImage?.filename_disk} />
      )}

      <div className="leaderboard-entry-content">
        <div className="leaderboard-entry-hero-section">
          {!isMobile && <S3Image className="leaderboard-main-image" uri={activity.info.mainImage?.filename_disk} />}

          <div className="leaderboard-entry-hero-section-content">
            <div className="leaderboard-entry-hero-section-tip">{t('labelTag')}</div>
            <div className="leaderboard-entry-hero-section-title">{t('title')}</div>

            {t('description') && (
              <div
                className="leaderboard-entry-hero-section-description"
                dangerouslySetInnerHTML={{ __html: t('description') || '' }}></div>
            )}
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
