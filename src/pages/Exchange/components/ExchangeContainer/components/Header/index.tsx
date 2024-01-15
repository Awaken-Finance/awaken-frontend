import { memo } from 'react';
import { Row, Col } from 'antd';

import { useTranslation } from 'react-i18next';

import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import { CurrencyLogos } from 'components/CurrencyLogo';
import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import Font from 'components/Font';
import FallOrRise from 'components/FallOrRise';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import CommonCard from 'components/CommonCard';

import { unifyWTokenSymbol } from 'utils';
import {
  formatPriceByNumberToDp,
  formatPercentage,
  formatPriceChange,
  formatPriceUSDWithSymBol,
  formatPrice,
} from 'utils/price';
import { BigNumber } from 'bignumber.js';

function Header() {
  const [{ pairInfo }] = useSwapContext();

  const { t } = useTranslation();

  if (!pairInfo) {
    return null;
  }

  return (
    <CommonCard title={null} className="trad-container-header">
      <Row align="middle" justify="space-between">
        <Col>
          <Row gutter={[32, 0]} align="middle">
            <Col>
              <Row gutter={[8, 0]} align="middle">
                <Col className="trad-container-heade-collect">
                  <CollectionBtnInList favId={pairInfo?.favId} id={pairInfo.id} isFav={pairInfo.isFav} />
                </Col>
                <Col>
                  <CurrencyLogos size={24} tokens={[pairInfo.token0, pairInfo.token1]} />
                </Col>
                <Col>
                  <Pairs tokenA={pairInfo?.token0} tokenB={pairInfo?.token1} size={20} weight="bold" />
                </Col>
                <Col>
                  <FeeRate useBg>{formatPercentage(pairInfo?.feeRate * 100)}</FeeRate>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row>
                <FallOrRise
                  size={16}
                  lineHeight={20}
                  weight="bold"
                  num={formatPriceByNumberToDp(pairInfo.price)}
                  useSubfix={false}
                  usePrefix={false}
                  status={pairInfo.pricePercentChange24h}
                />
              </Row>
              <Row>
                <Font size={12} lineHeight={18}>
                  {formatPriceUSDWithSymBol(pairInfo.priceUSD, '≈')}
                </Font>
              </Row>
            </Col>
            <Col>
              <Row>
                <Font lineHeight={18} size={12} color="two">
                  {t('ranking24H')}
                </Font>
              </Row>
              <Row gutter={[8, 0]}>
                <Col>
                  <FallOrRise
                    useSubfix={false}
                    lineHeight={20}
                    num={formatPriceByNumberToDp(pairInfo.priceChange24h)}
                  />
                </Col>
                <Col>
                  <FallOrRise lineHeight={20} num={new BigNumber(pairInfo.pricePercentChange24h).toFixed(2)} />
                </Col>
              </Row>
            </Col>
            <Col>
              <Row>
                <Font lineHeight={18} size={12} color="two">
                  {t('high24H')}
                </Font>
              </Row>
              <Row>
                <Font lineHeight={20}>{formatPriceChange(pairInfo.priceHigh24h, 4)}</Font>
              </Row>
            </Col>
            <Col>
              <Row>
                <Font lineHeight={18} size={12} color="two">
                  {t('low24H')}
                </Font>
              </Row>
              <Row>
                <Font lineHeight={20}>{formatPriceChange(pairInfo.priceLow24h, 4)}</Font>
              </Row>
            </Col>
            <Col>
              <Row>
                <Font lineHeight={18} size={12} color="two">
                  {`${t('vol24H')}${pairInfo?.token0?.symbol ? '(' + unifyWTokenSymbol(pairInfo.token0) + ')' : ''}`}
                </Font>
              </Row>
              <Row>
                <Font lineHeight={20}>{formatPrice(pairInfo?.volume24h)}</Font>
              </Row>
            </Col>
            <Col>
              <Row>
                <Font lineHeight={18} size={12} color="two">
                  {`${t('amount24H')}${pairInfo?.token1?.symbol ? '(' + unifyWTokenSymbol(pairInfo.token1) + ')' : ''}`}
                </Font>
              </Row>
              <Row>
                <Font lineHeight={20}>{formatPrice(pairInfo?.tradeValue24h)}</Font>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col>
          <ManageLiquidityBtn pair={pairInfo} useBtn />
        </Col>
      </Row>
    </CommonCard>
  );
}

export default memo(Header);
