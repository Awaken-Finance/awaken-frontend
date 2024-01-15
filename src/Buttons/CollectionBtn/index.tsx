import { MouseEvent, useCallback } from 'react';
import clsx from 'clsx';
import { useFavs } from 'pages/Overview/hooks/useFavs';
import useLoginCheck from 'hooks/useLoginCheck';
import { useMobile } from 'utils/isMobile';

import './index.less';

interface CollectionBtnProps {
  checked: boolean;
  onChange: (e: MouseEvent) => void;
  className?: string;
}

export default function CollectionBtn({ checked, onChange, className }: CollectionBtnProps) {
  const isMobile = useMobile();

  return (
    <div className={clsx('collect-icon', className)} onClick={onChange}>
      <i className={clsx(checked ? 'checked' : isMobile ? 'uncheck-mobile' : 'uncheck')} />
    </div>
  );
}

export function CollectionBtnInList({
  id = '',
  className = '',
  isFav,
  favId,
}: {
  id?: string;
  className?: string;
  isFav?: boolean;
  favId?: string | null;
}) {
  const [, { setFavs = () => null }] = useFavs();

  const selectFavHandler = useLoginCheck(
    {
      checkAccountSync: false,
    },
    useCallback(
      async (e: MouseEvent) => {
        e.stopPropagation();
        setFavs({ id, favId, isFav });
      },
      [id, favId, isFav, setFavs],
    ),
  );

  return (
    <CollectionBtn
      onChange={selectFavHandler}
      checked={isFav as boolean}
      className={clsx('collect-icon-list', className)}
    />
  );
}
