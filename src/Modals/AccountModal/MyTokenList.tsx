import { Col, Row } from 'antd';
import { CurrencyLogo } from 'components/CurrencyLogo';
import Font from 'components/Font';
import useChainId from 'hooks/useChainId';
import { formatPriceUSDWithSymBol } from 'utils/price';
import { getConfig } from 'aelf-web-login';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { getELFChainTokenURL } from 'utils';

import './MyTokenList.less';

type TokenInfoItem = {
  symbol: string;
  balance: number;
  amount: string;
  priceInUsd: string;
};

export function TokenItem({ data }: { data: TokenInfoItem }) {
  const { chainName } = useChainId();
  const networkType = getConfig().networkType;
  const displayChainName = useMemo(() => {
    return networkType == 'TESTNET' ? `${chainName} ${networkType}` : chainName;
  }, [chainName, networkType]);

  const src = useMemo(() => {
    return getELFChainTokenURL(data.symbol);
  }, [data.symbol]);

  return (
    <Row className="my-token-item" justify="center">
      <Col flex={'24px'} className="icon-col">
        <CurrencyLogo src={src} symbol={data.symbol} size={24} />
      </Col>
      <Col flex={'auto'}>
        <div className="symbol">
          <Font size={16} color="one" weight="medium">
            {data.symbol}
          </Font>
        </div>
        <div className="chain">
          <Font size={12} color="two">
            {displayChainName}
          </Font>
        </div>
      </Col>
      <Col flex={'auto'} className="balance-col">
        <div className="balance">
          <Font size={16} color="one">
            {new BigNumber(data.amount).dp(8)}
          </Font>
        </div>
        <div className="price-usd">
          <Font size={12} color="two">
            {formatPriceUSDWithSymBol(data.priceInUsd)}
          </Font>
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
