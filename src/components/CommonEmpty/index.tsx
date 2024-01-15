import { CSSProperties, ReactNode, useMemo } from 'react';

import { TableEmptyData, TableEmptyInternet, TableEmptySearch } from 'assets/images';
import './index.less';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface CommonEmptyProps {
  type?: 'nodata' | 'search' | 'internet';
  desc?: ReactNode;
  pic?: string;
  size?: 'large' | 'middle' | 'small';
  imageStyle?: CSSProperties;
  className?: string;
}

export default function CommonEmpty({ type, desc, pic, imageStyle, className, size = 'large' }: CommonEmptyProps) {
  const { t } = useTranslation();
  const sizeStyle = useMemo(() => {
    if (size === 'large') {
      return 'size-large-120';
    } else if (size === 'middle') {
      return 'size-middle-100';
    } else {
      return 'size-small-80';
    }
  }, [size]);

  const emptyStatus = useMemo(() => {
    const typesMap = {
      nodata: {
        src: TableEmptyData,
        desc: t('noData'),
      },
      search: {
        src: TableEmptySearch,
        desc: t('noSearch'),
      },
      internet: {
        src: TableEmptyInternet,
        desc: 'No Internet',
      },
    };
    let curType;
    if (!type) {
      curType = typesMap['search']; //default
    } else {
      curType = typesMap[type];
    }
    return (
      <div className={clsx('empty-placeholder', sizeStyle, className)}>
        {curType.src && <img src={pic || curType.src} style={imageStyle} />}
        {curType.desc && <span>{desc || curType.desc}</span>}
      </div>
    );
  }, [className, desc, imageStyle, pic, sizeStyle, t, type]);

  return emptyStatus;
}
