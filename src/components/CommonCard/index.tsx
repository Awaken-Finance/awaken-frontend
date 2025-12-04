import { useMemo } from 'react';
import { Col, Row } from 'antd';
import clsx from 'clsx';

import { useMobile } from 'utils/isMobile';

import './index.less';

interface CommonCardProps {
  children?: React.ReactChild;
  title?: React.ReactChild | string | null;
  className?: string;
}

export default function CommonCard({ children = '', title = 'title', className }: CommonCardProps) {
  const isMobile = useMobile();

  const titleDom = useMemo(() => {
    if (title === null) {
      return null;
    }

    const titleStyle = clsx('common-card-title', {
      'common-card-title-mobile': isMobile,
    });

    return (
      <Col span={24} className={titleStyle}>
        {title}
      </Col>
    );
  }, [title, isMobile]);

  const style = useMemo(() => {
    return clsx(
      'common-card',
      {
        'common-card-mobile': isMobile,
      },
      className,
    );
  }, [className, isMobile]);

  return (
    <Row className={style}>
      {titleDom}
      <Col span={24} className="common-card-container">
        {children}
      </Col>
    </Row>
  );
}
