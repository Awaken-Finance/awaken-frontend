import { useEffect, useState } from 'react';
import moment from 'moment';
import './styles.less';
import clsx from 'clsx';
import { padWithZero } from 'utils/format';
import { useTranslation } from 'react-i18next';

export type TActivityCountdownProps = {
  endTime: number | string;
  isRow?: boolean;
};

export type TActivityCountdownInfo = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const INIT_ACTIVITY_COUNTDOWN_INFO: TActivityCountdownInfo = {
  days: '-',
  hours: '-',
  minutes: '-',
  seconds: '-',
};

export const ActivityCountdown = ({ endTime, isRow = false }: TActivityCountdownProps) => {
  const { t } = useTranslation();
  const [info, setInfo] = useState<TActivityCountdownInfo>({
    ...INIT_ACTIVITY_COUNTDOWN_INFO,
  });

  useEffect(() => {
    const target = typeof endTime === 'number' ? moment.utc(endTime) : moment(endTime);

    const timer = setInterval(() => {
      const now = moment();
      const diffInMilliseconds = target.diff(now);

      if (diffInMilliseconds <= 0) {
        setInfo({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
      } else {
        const duration = moment.duration(diffInMilliseconds);
        setInfo({
          days: padWithZero(Math.floor(duration.asDays())),
          hours: padWithZero(duration.hours()),
          minutes: padWithZero(duration.minutes()),
          seconds: padWithZero(duration.seconds()),
        });
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [endTime]);

  return (
    <div className={clsx(['activity-countdown', isRow && 'activity-countdown-row'])}>
      <div className="activity-countdown-box">
        <div className="activity-countdown-box-content">{info.days}</div>
        <div className="activity-countdown-box-title">{t(isRow ? 'DayAbbr' : 'Day')}</div>
      </div>
      <div className="activity-countdown-box">
        <div className="activity-countdown-box-content">{info.hours}</div>
        <div className="activity-countdown-box-title">{t(isRow ? 'HoursAbbr' : 'Hours')}</div>
      </div>
      <div className="activity-countdown-box">
        <div className="activity-countdown-box-content">{info.minutes}</div>
        <div className="activity-countdown-box-title">{t(isRow ? 'MinutesAbbr' : 'Minutes')}</div>
      </div>
      <div className="activity-countdown-box">
        <div className="activity-countdown-box-content">{info.seconds}</div>
        <div className="activity-countdown-box-title">{t(isRow ? 'SecondsAbbr' : 'Seconds')}</div>
      </div>
    </div>
  );
};
