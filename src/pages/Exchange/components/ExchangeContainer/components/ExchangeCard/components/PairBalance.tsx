import BigNumber from 'bignumber.js';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import { unitConverter } from 'utils';
import { divDecimals } from 'utils/calculate';

import { Currency } from '@awaken/sdk-core';
import { useMobile } from 'utils/isMobile';
import { showValueWrapper } from 'utils/price';
import { formatSymbol } from 'utils/token';
import { useIsConnected } from 'hooks/useLogin';

interface PairBalanceProps {
  token?: Currency;
  balance?: BigNumber;
}

function PairBalance({ token, balance }: PairBalanceProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const isConnected = useIsConnected();

  return (
    <Row gutter={[6, 0]}>
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
          {t('Avbl')}
        </Font>
      </Col>
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
          {showValueWrapper(
            isConnected ? token?.decimals : undefined,
            unitConverter(divDecimals(balance, token?.decimals)),
          )}
        </Font>
      </Col>
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
          {formatSymbol(token?.symbol) || '--'}
        </Font>
      </Col>
    </Row>
  );
}

export default PairBalance;
