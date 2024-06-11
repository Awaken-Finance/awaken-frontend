import clsx from 'clsx';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { sleep } from 'utils';
import './styles.less';

export type SwapCircleProcessInterface = {
  start: () => void;
};

export type SwapCircleProcessProps = {
  className?: string;
};
export const SwapCircleProcess = forwardRef(({ className }: SwapCircleProcessProps, ref) => {
  const [isCircleAnimation, setIsCircleAnimation] = useState(false);

  const start = useCallback(async () => {
    setIsCircleAnimation(false);
    await sleep(50);
    setIsCircleAnimation(true);
  }, []);
  useImperativeHandle(ref, () => ({ start }));

  return (
    <div className={clsx(['swap-circle-warp', className, isCircleAnimation && 'swap-circle-warp-animation'])}>
      <div className="swap-circle-left"></div>
      <div className="swap-circle-right"></div>
      <div className="swap-circle-fill"></div>
    </div>
  );
});
