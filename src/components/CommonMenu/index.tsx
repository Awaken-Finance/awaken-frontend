import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import './index.less';

interface CommonMenuProps {
  onChange?: (menun: string | number) => void;
  className?: string;
  menus: any[];
  defaultValue?: string;
  value?: string | number;
  renderItem?: (<T>(item: T) => React.ReactNode) | null;
}

export default function CommonMenu({
  onChange,
  className = '',
  menus = [],
  defaultValue = '',
  value,
  renderItem = null,
}: CommonMenuProps) {
  const [menun, setMenu] = useState<string>(defaultValue);
  const { t } = useTranslation();

  const menunChange = useCallback(
    (v) => {
      if (v === menun) {
        return;
      }

      setMenu(v);
      onChange && onChange(v);
    },
    [onChange, menun],
  );

  const renderMeun = useMemo(() => {
    return menus.map(({ key, name }) => (
      <div
        key={key}
        className={clsx('menu-item', menun === key && 'menu-item-active')}
        onClick={() => menunChange(key)}>
        {renderItem ? renderItem({ key, name }) : t(name)}
      </div>
    ));
  }, [menus, menun, menunChange, t, renderItem]);

  useEffect(() => {
    if (value === menun || typeof value === 'undefined') {
      return;
    }

    setMenu(value as string);
  }, [value, menun]);

  return <div className={clsx('menu-content', className)}>{renderMeun}</div>;
}
