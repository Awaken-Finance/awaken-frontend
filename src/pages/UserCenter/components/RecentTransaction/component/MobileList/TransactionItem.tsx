import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { RecentTransaction } from 'pages/UserCenter/type';
import Font from 'components/Font';
import { Pair, Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import BigNumber from 'bignumber.js';
import CommonCopy from 'components/CommonCopy';

import './index.less';
import { getExploreLink, shortenTransactionId } from 'utils';
import { getTokenWeights } from 'utils/token';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';

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
  return (
    <Row className="transaction-list-item" gutter={[0, 8]}>
      <Col span={24}>
        <Row justify="space-between">
          <Col>
            <Row gutter={[8, 0]} align="middle">
              <Col className="height-20">
                <Pairs tokenA={tradePair?.token0?.symbol} tokenB={tradePair?.token1} lineHeight={20} weight="medium" />
              </Col>
              <Col className="height-20">
                <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
              </Col>
            </Row>
          </Col>
          <Col className="align-right">
            <Font color="two" lineHeight={20}>
              {moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Font>
          </Col>
          <Col span={24} className="height-20">
            <Font
              lineHeight={20}
              color={
                getTokenWeights(tradePair.token0.symbol) > getTokenWeights(tradePair.token1.symbol) &&
                tradePair.token0.symbol < tradePair.token1.symbol
                  ? side === 0
                    ? 'fall'
                    : 'rise'
                  : side === 0
                  ? 'rise'
                  : 'fall'
              }>
              {getTokenWeights(tradePair.token0.symbol) > getTokenWeights(tradePair.token1.symbol) &&
              tradePair.token0.symbol < tradePair.token1.symbol
                ? side === 0
                  ? t('sell')
                  : t('buy')
                : side === 0
                ? t('buy')
                : t('sell')}
            </Font>
          </Col>
        </Row>
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <PriceDigits price={price || 0} className={getFontStyle({ lineHeight: 20 })} />
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
        <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={totalPriceInUsd ?? 0} />,
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Fee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{new BigNumber(totalFee ?? 0).dp(8)}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.[side === 0 ? 'token1' : 'token0']?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('transactionFee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{new BigNumber(transactionFee ?? 0).dp(8)}</Font>
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
              {shortenTransactionId(transactionHash || '')}
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
