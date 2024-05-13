import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import CommonCard from 'components/CommonCard';
import Font from 'components/Font';
import FallOrRise from 'components/FallOrRise';

import { PoolItem } from 'types';
import { unifyWTokenSymbol, unitConverter } from 'utils';
import { formatPriceByNumberToDp, formatPercentage, formatBalance, showValueWrapper } from 'utils/price';

import './index.less';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';

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
                num={pairInfo.price}
                isPrice
                useSuffix={false}
                usePrefix={false}
                status={pairInfo.pricePercentChange24h}
              />
            </Col>
            <Col span={24}>
              <PriceUSDDigits
                className={getFontStyle({ size: 12, lineHeight: 18, weight: 'medium' })}
                price={pairInfo.priceUSD}
                prefix="≈$"
              />
            </Col>
            <Col span={24}>
              <Row gutter={[8, 0]}>
                <Col>
                  <FallOrRise
                    lineHeight={18}
                    num={formatPriceByNumberToDp(pairInfo.priceChange24h)}
                    useSuffix={false}
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
              <Font lineHeight={18} size={12} color="two" className="font-two-line" align="right">
                {`${t('vol24H')}(${formatSymbol(
                  showValueWrapper(pairInfo?.token0?.symbol, unifyWTokenSymbol(pairInfo?.token0)),
                )})`}
              </Font>
            </Col>
            <Col span={12}>
              <Font lineHeight={18} size={12} align="right">
                {formatBalance(pairInfo.priceHigh24h)}
              </Font>
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
              <Font lineHeight={18} size={12} color="two" className="font-two-line" align="right">
                {`${t('amount24H')}(${formatSymbol(
                  showValueWrapper(pairInfo?.token1?.symbol, unifyWTokenSymbol(pairInfo?.token1)),
                )})`}
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
