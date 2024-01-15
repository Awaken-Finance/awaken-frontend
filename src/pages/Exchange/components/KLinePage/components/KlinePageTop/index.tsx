import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import CommonCard from 'components/CommonCard';
import Font from 'components/Font';
import FallOrRise from 'components/FallOrRise';

import { PoolItem } from 'types';
import { unitConverter } from 'utils';
import { formatPriceByNumberToDp, formatPercentage, formatBalance, formatPriceUSDWithSymBol } from 'utils/price';

import './index.less';

export default ({ pairInfo }: { pairInfo: PoolItem }) => {
  const { t } = useTranslation();
  return (
    <CommonCard title={null} className="kline-page-top">
      <Row justify="space-between" gutter={[16, 0]}>
        <Col span={12}>
          <Row>
            <Col span={24}>
              <FallOrRise
                size={32}
                lineHeight={36}
                weight="bold"
                num={formatPriceByNumberToDp(pairInfo.price)}
                useSubfix={false}
                usePrefix={false}
                status={pairInfo.pricePercentChange24h}
              />
            </Col>
            <Col span={24}>
              <Font size={12} lineHeight={18} weight="medium">
                {formatPriceUSDWithSymBol(pairInfo.priceUSD, '≈')}
              </Font>
            </Col>
            <Col span={24}>
              <Row gutter={[8, 0]}>
                <Col>
                  <FallOrRise
                    lineHeight={18}
                    num={formatPriceByNumberToDp(pairInfo.priceChange24h)}
                    useSubfix={false}
                    size={12}
                  />
                </Col>
                <Col>
                  <FallOrRise lineHeight={18} size={12} num={formatPercentage(pairInfo.pricePercentChange24h)} />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row wrap>
            <Col span={12}>
              <Font lineHeight={18} size={12} color="two">
                {t('high24H')}
              </Font>
            </Col>
            <Col span={12} className="text-right">
              <Font lineHeight={18} size={12} color="two">
                {`${t('vol24H')}${pairInfo?.token0?.symbol ? '(' + pairInfo.token0.symbol + ')' : ''}`}
              </Font>
            </Col>
            <Col span={12}>
              <FallOrRise
                lineHeight={18}
                size={12}
                num={formatPriceByNumberToDp(pairInfo.pricePercentChange24h)}
                useSubfix={false}
              />
            </Col>
            <Col span={12} className="text-right">
              <Font lineHeight={18} size={12}>
                {unitConverter(pairInfo?.volume24h ?? '', 4)}
              </Font>
            </Col>
          </Row>
          <Row wrap className="box-margin">
            <Col span={12}>
              <Font lineHeight={18} size={12} color="two">
                {t('low24H')}
              </Font>
            </Col>
            <Col span={12} className="text-right">
              <Font lineHeight={18} size={12} color="two">
                {`${t('vol24H')}${pairInfo?.token1?.symbol ? '(' + pairInfo.token1.symbol + ')' : ''}`}
              </Font>
            </Col>
            <Col span={12}>
              <Font lineHeight={18} size={12}>
                {formatBalance(pairInfo.priceLow24h)}
              </Font>
            </Col>
            <Col span={12} className="text-right">
              <Font lineHeight={18} size={12}>
                {unitConverter(pairInfo?.tradeValue24h ?? '', 4)}
              </Font>
            </Col>
          </Row>
        </Col>
      </Row>
    </CommonCard>
  );
};
