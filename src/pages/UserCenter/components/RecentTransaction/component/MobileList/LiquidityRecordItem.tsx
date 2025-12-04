import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { LiquidityRecord } from 'pages/UserCenter/type';
import Font from 'components/Font';
import { Pair, Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import CommonCopy from 'components/CommonCopy';

import './index.less';
import { getExploreLink } from 'utils';
import { stringMidShort } from 'utils/string';
import { ZERO } from 'constants/misc';

export default function LiquidityRecordItem({
  item: { tradePair, timestamp, token0Amount, token1Amount, transactionFee, transactionHash },
}: {
  item: LiquidityRecord;
}) {
  const { t } = useTranslation();
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
            <Font color="two" lineHeight={20}>
              {moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Font>
          </Col>
        </Row>
      </Col>

      <Col span={12} className="height-20" style={{ marginTop: '4px' }}>
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
          {t('amount')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{formatPriceChange(token1Amount)}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={tradePair?.token1?.symbol} />
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
        <Row align="middle">
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
