import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import './index.less';

interface CommonMenuProps {
  onChange?: (menu: string | number) => void;
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
  const [menu, setMenu] = useState<string>(defaultValue);
  const { t } = useTranslation();

  const menuChange = useCallback(
    (v: string) => {
      if (v === menu) {
        return;
      }

      setMenu(v);
      onChange && onChange(v);
    },
    [onChange, menu],
  );

  const renderMenu = useMemo(() => {
    return menus.map(({ key, name }) => (
      <div key={key} className={clsx('menu-item', menu === key && 'menu-item-active')} onClick={() => menuChange(key)}>
        {renderItem ? renderItem({ key, name }) : t(name)}
      </div>
    ));
  }, [menus, menu, menuChange, t, renderItem]);

  useEffect(() => {
    if (value === menu || typeof value === 'undefined') {
      return;
    }

    setMenu(value as string);
  }, [value, menu]);

  return <div className={clsx('menu-content', className)}>{renderMenu}</div>;
}
