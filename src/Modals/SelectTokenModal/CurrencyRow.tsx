import { Currency } from '@awaken/sdk-core';
import { List, Row, Col } from 'antd';
import BigNumber from 'bignumber.js';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { isEqCurrency } from 'utils';

import { Pair } from 'components/Pair';
import Font from 'components/Font';
import { useMemo } from 'react';
import { divDecimals } from 'utils/calculate';

export default function CurrencyRow({ currency, balance }: { currency: Currency; balance?: BigNumber }) {
  const [{ tokenCallBack, selectedToken }, { dispatch }] = useModal();
  const isSelected = isEqCurrency(selectedToken, currency);

  const displayBalance = useMemo(() => {
    return divDecimals(balance, currency.decimals);
  }, [balance, currency]);

  return (
    <List.Item
      className="select-token-list-item"
      onClick={() => {
        if (isSelected) return;
        tokenCallBack?.(currency);
        dispatch(basicModalView.setSelectTokenModal.actions(false));
      }}>
      <Col span={24}>
        <Row justify="space-between" align="middle" className="select-token-list-item">
          <Col>
            <Row gutter={[8, 0]} align="middle">
              <Col className="currency-logo-col">
                <CurrencyLogo size={24} currency={currency} />
              </Col>
              <Col>
                <Pair lineHeight={24} size={16} weight="medium" symbol={currency.symbol} />
              </Col>
            </Row>
          </Col>
          <Col>
            <Font lineHeight={24} size={16}>
              {displayBalance}
            </Font>
          </Col>
        </Row>
      </Col>
    </List.Item>
  );
}
