import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import { Pair, Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import CommonCopy from 'components/CommonCopy';

import './index.less';
import { getExploreLink } from 'utils';
import { getTokenWeights } from 'utils/token';
import PriceDigits from 'components/PriceDigits';
import getFontStyle, { FontColor } from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { useMemo } from 'react';
import { getRealReceivePriceWithDexFee } from 'utils/calculate';
import { ONE, ZERO } from 'constants/misc';
import { stringMidShort } from 'utils/string';
import CommonTooltip from 'components/CommonTooltip';
import { SwapOrderRouting } from 'pages/Swap/components/SwapOrderRouting';
import { RecentTransaction } from 'types/transactions';

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
    percentRoutes,
    labsFee,
  },
}: {
  item: RecentTransaction;
}) {
  const { t } = useTranslation();
  const sideInfo = useMemo<{
    label: string;
    fontColor?: FontColor;
  }>(() => {
    if (side === 2)
      return {
        label: t('Swap'),
      };
    const isReverse =
      // trade pair sort
      getTokenWeights(tradePair.token0.symbol) > getTokenWeights(tradePair.token1.symbol) &&
      // contract sort
      tradePair.token0.symbol < tradePair.token1.symbol;
    const isBuy = Boolean(Number(side === 0) ^ Number(isReverse));
    if (isBuy) {
      return {
        label: t('buy'),
        fontColor: 'rise',
      };
    } else {
      return {
        label: t('sell'),
        fontColor: 'fall',
      };
    }
  }, [side, t, tradePair.token0.symbol, tradePair.token1.symbol]);

  const realPrice = useMemo(
    () =>
      getRealReceivePriceWithDexFee({
        side,
        token0Amount,
        token1Amount,
        dexFee: totalFee,
      }),
    [side, token0Amount, token1Amount, totalFee],
  );

  const receiveAveragePrice = useMemo(() => (side !== 1 ? price : ONE.div(price ?? 1).toFixed()), [price, side]);

  const priceSymbol = useMemo(
    () => (side !== 0 ? tradePair.token0.symbol : tradePair.token1.symbol),
    [side, tradePair.token0.symbol, tradePair.token1.symbol],
  );

  return (
    <Row className="transaction-list-item" gutter={[0, 8]}>
      <Col span={24}>
        <Row justify="space-between" wrap={false}>
          <Col flex={'1'}>
            <Row gutter={[8, 0]} align="top" wrap={false}>
              <Col className="transaction-list-item-pairs-wrap">
                <Pairs
                  tokenA={tradePair?.token0?.symbol}
                  tokenB={tradePair?.token1}
                  isAutoOrder={side !== 2}
                  lineHeight={20}
                  weight="medium"
                />
              </Col>
              <Col>
                {side === 2 ? (
                  <CommonTooltip
                    width={'400px'}
                    placement="top"
                    title={<SwapOrderRouting percentRoutes={percentRoutes} />}
                    getPopupContainer={(v) => v}
                    buttonTitle={t('ok')}
                    headerDesc={t('Order Routing')}>
                    <FeeRate useBg usePercent={false}>
                      {`Swap`}
                    </FeeRate>
                  </CommonTooltip>
                ) : (
                  <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
                )}
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
          <Font lineHeight={20} color={sideInfo.fontColor}>
            {sideInfo.label}
          </Font>
        </Col>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <PriceDigits price={realPrice} className={getFontStyle({ lineHeight: 20 })} />
        &nbsp;
        <Pair lineHeight={20} symbol={priceSymbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Pay')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20}>{formatPriceChange(side === 0 ? token1Amount : token0Amount)}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={side === 0 ? tradePair?.token1?.symbol : tradePair?.token0?.symbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Receive')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20}>{`${formatPriceChange(side === 0 ? token0Amount : token1Amount)}`}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={side === 0 ? tradePair?.token0?.symbol : tradePair?.token1?.symbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('TotalValue')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={totalPriceInUsd} />,
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Average Price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <PriceDigits price={receiveAveragePrice} className={getFontStyle({ lineHeight: 20 })} />
        &nbsp;
        <Pair lineHeight={24} symbol={priceSymbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('LP Fee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20}>
          {`-${ZERO.plus(totalFee ?? 0)
            .dp(8)
            .toFixed()}`}
        </Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.[side === 0 ? 'token1' : 'token0']?.symbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Fee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20}>
          {`-${ZERO.plus(labsFee || 0)
            .dp(tradePair?.[side === 0 ? 'token0' : 'token1']?.decimals)
            .toFixed()}`}
        </Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.[side === 0 ? 'token0' : 'token1']?.symbol} />
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('transactionFee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20}>{`-${ZERO.plus(transactionFee ?? 0)
          .dp(8)
          .toFixed()}`}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={'ELF'} />
      </Col>

      <Col span={11} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('transactionID')}
        </Font>
      </Col>
      <Col span={13} className="align-right height-20 line-height-20">
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
