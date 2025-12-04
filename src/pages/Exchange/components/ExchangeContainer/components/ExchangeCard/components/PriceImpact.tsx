import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import CommonTooltip from 'components/CommonTooltip';

import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import BigNumber from 'bignumber.js';
import { bigNumberToString } from 'utils/swap';
import { useMemo } from 'react';

export default function PriceImpact({ value }: { value?: BigNumber }) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const valStr = useMemo(() => {
    if (new BigNumber(value ?? 0).lt(-100)) {
      return '-100%';
    }

    return `${bigNumberToString(new BigNumber(value ?? 0), 2)}%`;
  }, [value]);
  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
            {t('priceSlippage')}
          </Font>
        </Col>
        <Col>
          <CommonTooltip
            placement="topLeft"
            title={t('pointTip')}
            headerDesc={t('priceSlippage')}
            buttonTitle={t('ok')}
          />
        </Col>
      </Row>
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
          {valStr}
        </Font>
      </Col>
    </Row>
  );
}
