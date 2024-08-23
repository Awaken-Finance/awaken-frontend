import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import { Currency } from '@awaken/sdk-core';
import { useMemo } from 'react';
import { formatSymbol } from 'utils/token';
import BigNumber from 'bignumber.js';

export type TLimitMaxValueProps = {
  token?: Currency;
  value: BigNumber;
  isBuy?: boolean;
};
export const LimitMaxValue = ({ token, value, isBuy = true }: TLimitMaxValueProps) => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const symbol = useMemo(() => formatSymbol(token?.symbol), [token?.symbol]);
  const title = useMemo(() => (isBuy ? t('Max Buy') : t('Max Receive')), [isBuy, t]);
  const valueStr = useMemo(() => value.toFixed(), [value]);

  return (
    <Row justify="space-between">
      <Row align="middle">
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
          {title}
        </Font>
      </Row>
      <Col>
        <Row gutter={[2, 0]}>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
              {valueStr}
            </Font>
          </Col>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
              {symbol}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
