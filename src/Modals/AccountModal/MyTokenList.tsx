import { Col, Row } from 'antd';
import { CurrencyLogo } from 'components/CurrencyLogo';
import Font from 'components/Font';
import useChainId from 'hooks/useChainId';
import { useMemo } from 'react';
import { getELFChainTokenURL } from 'utils';

import './MyTokenList.less';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';
import { ZERO } from 'constants/misc';
import { WEB_LOGIN_CONFIG } from 'config/webLoginConfig';

type TokenInfoItem = {
  symbol: string;
  balance: number;
  amount: string;
  priceInUsd: string;
};

export function TokenItem({ data }: { data: TokenInfoItem }) {
  const { chainName } = useChainId();
  const displayChainName = useMemo(() => {
    return WEB_LOGIN_CONFIG.baseConfig.networkType == 'TESTNET'
      ? `${chainName} ${WEB_LOGIN_CONFIG.baseConfig.networkType}`
      : chainName;
  }, [chainName]);

  const src = useMemo(() => {
    return getELFChainTokenURL(data.symbol);
  }, [data.symbol]);

  return (
    <Row className="my-token-item" align={'middle'} justify="center" wrap={false}>
      <Col className="icon-col">
        <CurrencyLogo src={src} symbol={data.symbol} size={24} />
      </Col>
      <Col flex={'auto'}>
        <div className="symbol">
          <Font size={16} lineHeight={24} color="one" weight="medium">
            {formatSymbol(data.symbol)}
          </Font>
        </div>
        <div className="chain">
          <Font size={12} color="two">
            {displayChainName}
          </Font>
        </div>
      </Col>
      <Col className="balance-col">
        <div className="balance">
          <Font size={16} lineHeight={24} color="one">
            {ZERO.plus(data.amount).dp(8)}
          </Font>
        </div>
        <div className="price-usd">
          <PriceUSDDigits className={getFontStyle({ size: 12, color: 'two' })} price={data.priceInUsd} />
        </div>
      </Col>
    </Row>
  );
}

export default function MyTokenList({ items, address }: { items: any[]; address: string }) {
  return (
    <div className="my-token-list">
      {items.map((item, index) => {
        if (address !== item.address) {
          return;
        }
        return <TokenItem key={`item-${index}`} data={item} />;
      })}
    </div>
  );
}
