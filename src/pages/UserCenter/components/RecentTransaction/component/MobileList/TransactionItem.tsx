import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { RecentTransaction } from 'pages/UserCenter/type';
import Font from 'components/Font';
import { Pair, Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import CommonCopy from 'components/CommonCopy';

import './index.less';
import { getExploreLink } from 'utils';
import { getTokenWeights } from 'utils/token';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { useMemo } from 'react';
import { getRealPrice } from 'utils/calculate';
import { ZERO } from 'constants/misc';
import { stringMidShort } from 'utils/string';

export default function TransactionItem({
  item: {
    tradePair,
    timestamp,
    side,
    price,
    token0Amount,
    token1Amount,
    transactionFee,
    transactionHash,
    totalPriceInUsd,
    totalFee,
  },
}: {
  item: RecentTransaction;
}) {
  const { t } = useTranslation();
  const isBuy = useMemo(() => {
    const isReverse =
      // trade pair sort
      getTokenWeights(tradePair.token0.symbol) > getTokenWeights(tradePair.token1.symbol) &&
      // contract sort
      tradePair.token0.symbol < tradePair.token1.symbol;
    return Boolean(Number(side === 0) ^ Number(isReverse));
  }, [side, tradePair.token0.symbol, tradePair.token1.symbol]);

  const realPrice = useMemo(
    () =>
      getRealPrice({
        side,
        token0Amount,
        token1Amount,
        feeRate: tradePair.feeRate,
      }),
    [side, token0Amount, token1Amount, tradePair.feeRate],
  );

  return (
    <Row className="transaction-list-item" gutter={[0, 8]}>
      <Col span={24}>
        <Row justify="space-between" wrap={false}>
          <Col flex={'1'}>
            <Row gutter={[8, 0]} align="top" wrap={false}>
              <Col className="transaction-list-item-pairs-wrap">
                <Pairs tokenA={tradePair?.token0?.symbol} tokenB={tradePair?.token1} lineHeight={20} weight="medium" />
              </Col>
              <Col>
                <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
              </Col>
            </Row>
          </Col>
          <Col flex={'1'} className="align-right">
            <Font color="two" size={12} lineHeight={20}>
              {moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Font>
          </Col>
        </Row>
        <Col span={24} className="font-size-0">
          <Font lineHeight={20} color={isBuy ? 'rise' : 'fall'}>
            {isBuy ? t('buy') : t('sell')}
          </Font>
        </Col>
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <PriceDigits price={realPrice} className={getFontStyle({ lineHeight: 20 })} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('amount')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{formatPriceChange(token0Amount)}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.token0?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('total')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{`${formatPriceChange(token1Amount)}`}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.token1?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('TotalValue')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={totalPriceInUsd} />,
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Average Price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <PriceDigits price={price} className={getFontStyle({ lineHeight: 20 })} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Fee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>
          {`-${ZERO.plus(totalFee ?? 0)
            .dp(8)
            .toFixed()}`}
        </Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.[side === 0 ? 'token1' : 'token0']?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('transactionFee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{`-${ZERO.plus(transactionFee ?? 0)
          .dp(8)
          .toFixed()}`}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={'ELF'} />
      </Col>

      <Col span={11} className="height-20">
        <Font lineHeight={20} color="two">
          {t('transactionID')}
        </Font>
      </Col>
      <Col span={13} className="align-right height-20">
        <Row>
          <Col>
            <a
              target="_blank"
              href={getExploreLink(transactionHash || '', 'transaction')}
              style={{ wordBreak: 'break-all' }}>
              {stringMidShort(transactionHash || '', 8)}
            </a>
          </Col>
          <Col>
            <CommonCopy copyInfo="" copyValue={transactionHash} className="copy-address"></CommonCopy>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
