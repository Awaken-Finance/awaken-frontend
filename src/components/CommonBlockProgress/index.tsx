import clsx from 'clsx';
import { useMemo } from 'react';
import './index.less';

export type CommonBlockProgressProps = {
  value: number;
  blocks?: number;
  totalProgress?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function CommonBlockProgress({
  value,
  blocks = 4,
  totalProgress = 100,
  onChange,
  disabled = false,
}: CommonBlockProgressProps) {
  const blockList = useMemo(() => {
    const list = [];
    for (let i = 0; i < blocks; i++) {
      list.push({
        progress: Math.floor((totalProgress / blocks) * (i + 1)),
      });
    }
    return list;
  }, [blocks, totalProgress]);

  const onClickBlock = (b: { progress: number }) => {
    onChange(b.progress);
  };

  return (
    <div className="common-block-progress">
      {blockList.map((b) => {
        return (
          <div
            className={clsx({
              'block-item': true,
              'block-item-active': b.progress <= value,
            })}
            onClick={() => !disabled && onClickBlock(b)}>
            <div className="block-bar"></div>
            <div className="block-label">{b.progress}%</div>
          </div>
        );
      })}
    </div>
  );
}
