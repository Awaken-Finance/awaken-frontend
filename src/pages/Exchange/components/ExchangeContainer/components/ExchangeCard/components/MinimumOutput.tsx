import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { ZERO } from 'constants/misc';
import { Currency } from '@awaken/sdk-core';
import { bigNumberToString } from 'utils/swap';

export default function MinimumOutput({
  value,
  token,
  maxValue,
}: {
  value?: BigNumber.Value;
  token?: Currency;
  maxValue?: BigNumber.Value;
}) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const valStr = useMemo(() => {
    const bigVal = new BigNumber(value ?? ZERO);
    const bigMaxVal = new BigNumber(maxValue ?? ZERO).dp(token?.decimals ?? 18);

    return bigNumberToString(BigNumber.min(bigVal, bigMaxVal), token?.decimals);
  }, [value, maxValue, token?.decimals]);

  return (
    <Row justify="space-between">
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
          {t('minEaring')}
        </Font>
      </Col>
      <Col>
        <Row gutter={[2, 0]}>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
              {valStr}
            </Font>
          </Col>
          <Col>
            <Font color="two" size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20}>
              {token?.symbol || ''}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
