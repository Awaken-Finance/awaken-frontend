import { useMemo, ReactNode } from 'react';
import { useCopyToClipboard } from 'react-use';
import { Row, Col } from 'antd';
import clsx from 'clsx';
import { IconNotificationCopy } from 'assets/icons';
import { message } from 'antd';

import './index.less';

export interface CommonCopy {
  copyInfo?: string;
  copyValue?: string | undefined;
  children?: ReactNode;
  className?: string;
  onSuccess?: (val: string) => void;
}

export default function Copy({
  copyInfo = 'copy info',
  copyValue = undefined,
  children,
  className,
  onSuccess,
}: CommonCopy) {
  const [, setCopied] = useCopyToClipboard();

  const style = useMemo(() => {
    return clsx('common-copy', className);
  }, [className]);

  const handleCopy = () => {
    setCopied(copyValue || copyInfo);

    if (typeof onSuccess == 'function') {
      onSuccess(copyInfo);
    }

    message.success('copied success');
  };

  return (
    <Row gutter={[4, 0]} className={style} align="middle" onClick={handleCopy}>
      <Col className="common-copy-content">{children || copyInfo}</Col>
      <Col className="copy-icon-box">
        <IconNotificationCopy className="copy-icon" />
      </Col>
    </Row>
  );
}
