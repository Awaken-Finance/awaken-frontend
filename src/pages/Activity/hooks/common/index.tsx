import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

export const useIsCountdownFinished = (time?: string) => {
  const [isFinished, setIsFinished] = useState(moment(time).diff(moment()) <= 0);

  useEffect(() => {
    if (!time) return;

    const target = moment(time);
    const now = moment();
    const diff = target.diff(now);
    let timer: NodeJS.Timeout | undefined = undefined;
    if (diff <= 0) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
      if (diff <= 20 * 10 ** 8) {
        timer = setTimeout(() => {
          setIsFinished(true);
        }, diff);
      }
    }

    return () => {
      timer && clearTimeout(timer);
    };
  }, [time]);

  return isFinished;
};

export type TUseActivityStatusParams = {
  startTime?: string;
  endTime?: string;
};

export enum ActivityStatusEnum {
  Preparation = 1,
  Execution,
  Completion,
}
export const useActivityStatus = ({ startTime, endTime }: TUseActivityStatusParams) => {
  const isStart = useIsCountdownFinished(startTime);
  const isEnd = useIsCountdownFinished(endTime);

  return useMemo(() => {
    if (!isStart) return ActivityStatusEnum.Preparation;
    if (isEnd) return ActivityStatusEnum.Completion;
    return ActivityStatusEnum.Execution;
  }, [isEnd, isStart]);
};
