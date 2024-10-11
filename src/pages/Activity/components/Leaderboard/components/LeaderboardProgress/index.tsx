import clsx from 'clsx';
import './styles.less';
import { ReactNode, useMemo } from 'react';
import { Tooltip } from 'antd';

export type TLeaderboardProgressProps = {
  percent: number;
  className?: string;
  tipContent?: ReactNode;
};

export const LeaderboardProgress = ({ percent, className, tipContent }: TLeaderboardProgressProps) => {
  const isFull = useMemo(() => percent >= 100, [percent]);
  const fillPosition = useMemo(() => (percent >= 100 ? 0 : `${100 - percent}%`), [percent]);

  return (
    <div className={clsx(['leaderboard-progress-wrap', className])}>
      <div className="leaderboard-progress-line">
        <div className="leaderboard-progress-line-fill" style={{ right: fillPosition }}>
          <Tooltip
            getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
            placement="bottom"
            visible={true}
            key={fillPosition}
            title={
              <div className="leaderboard-progress-tooltip-content">
                <div className="leaderboard-progress-tooltip-content-top">{`${percent}%`}</div>
                <div className="leaderboard-progress-tooltip-content-bottom">{tipContent}</div>
              </div>
            }
            className="leaderboard-progress-tooltip-wrap"
            autoAdjustOverflow={true}
            showArrow={false}>
            <div className="leaderboard-progress-tooltip"></div>
          </Tooltip>
        </div>
      </div>
      <div className={clsx(['leaderboard-progress-end', isFull && 'leaderboard-progress-end-full'])} />
    </div>
  );
};
