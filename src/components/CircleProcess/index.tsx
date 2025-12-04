import clsx from 'clsx';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { sleep } from 'utils';
import './styles.less';

export interface CircleProcessInterface {
  start: () => void;
}

export type CircleProcessProps = {
  className?: string;
};
export const CircleProcess = forwardRef(({ className }: CircleProcessProps, ref) => {
  const [isCircleAnimation, setIsCircleAnimation] = useState(false);

  const start = useCallback(async () => {
    setIsCircleAnimation(false);
    await sleep(50);
    setIsCircleAnimation(true);
  }, []);
  useImperativeHandle(ref, () => ({ start }));

  return (
    <div className={clsx(['circle-process-warp', className, isCircleAnimation && 'circle-process-warp-animation'])}>
      <div className="circle-process-left"></div>
      <div className="circle-process-right"></div>
      <div className="circle-process-fill"></div>
    </div>
  );
});
