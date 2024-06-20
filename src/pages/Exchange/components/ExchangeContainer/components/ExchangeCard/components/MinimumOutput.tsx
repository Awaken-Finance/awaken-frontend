import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { ZERO } from 'constants/misc';
import { Currency } from '@awaken/sdk-core';
import { bigNumberToString } from 'utils/swap';
import { formatSymbol } from 'utils/token';
import CommonTooltip from 'components/CommonTooltip';

export default function MinimumOutput({
  value,
  token,
}: {
  value?: BigNumber.Value;
  token?: Currency;
  maxValue?: BigNumber.Value;
}) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const valStr = useMemo(() => {
    const bigVal = new BigNumber(value ?? ZERO);

    return bigNumberToString(bigVal, token?.decimals);
  }, [value, token?.decimals]);

  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
            {t('minEaring')}
          </Font>
        </Col>
        <Col>
          <CommonTooltip
            placement="topLeft"
            title={t(
              'Min.Received refers to the exchange result at the price corresponding to the Max.Slippage you set.Generally, it will be more.',
            )}
            headerDesc={t('minEaring')}
            buttonTitle={t('ok')}
          />
        </Col>
      </Row>
      <Col>
        <Row gutter={[2, 0]}>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
              {valStr}
            </Font>
          </Col>
          <Col>
            <Font color="two" size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20}>
              {formatSymbol(token?.symbol) || ''}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
