import { useMemo } from 'react';
import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';

import { unitConverter } from 'utils';
import { getPairTokenRatio } from 'utils/swap';
import { Reserves } from 'types/swap';

function CurrentPrice({ tokenA, tokenB, reserves }: { tokenA?: Currency; tokenB?: Currency; reserves?: Reserves }) {
  const { t } = useTranslation();

  const price = useMemo(() => {
    return unitConverter(
      getPairTokenRatio({
        tokenA,
        tokenB,
        reserves,
      }),
      8,
    );
  }, [tokenA, tokenB, reserves]);
  return (
    <Row className="item-row current-price-disable-input" justify="space-between" align="middle">
      <Col>
        <Font color="three" lineHeight={20}>
          {t('price')}
        </Font>
      </Col>
      <Col className="panel-balance">
        <Row gutter={[8, 0]} align="middle">
          <Col>
            <Font size={16} lineHeight={24} weight="medium" color="three">
              {price}
            </Font>
          </Col>
          <Col>
            <Font color="three" lineHeight={20}>
              {tokenB?.symbol || ''}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default CurrentPrice;
