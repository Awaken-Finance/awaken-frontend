import { Col, Row } from 'antd';
import CommonTooltip from 'components/CommonTooltip';
import { CurrencyLogo, CurrencyLogos } from 'components/CurrencyLogo';
import FeeRate from 'components/FeeRate';
import Font from 'components/Font';
import { Pairs } from 'components/Pair';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { ONE, ZERO } from 'constants/misc';
import { useTranslation } from 'react-i18next';
import { TLiquidityPositionItem } from 'types/portfolio';
import getFontStyle from 'utils/getFontStyle';
import { formatLiquidity, formatPercentage, formatPrice, formatTokenAmount } from 'utils/price';
import { formatSymbol } from 'utils/token';
import './styles.less';
import { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import { IconPriceSwitch } from 'assets/icons';
import CommonButton from 'components/CommonButton';
import useLoginCheck from 'hooks/useLoginCheck';
import { useHistory } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';
import { TokenInfo } from 'types';

export type TPortfolioPositionItemProps = {
  item: TLiquidityPositionItem;
};

enum EstimatedAPRType {
  week = 0,
  month,
  all,
}

const ESTIMATED_APR_TYPE_LABEL_MAP = {
  [EstimatedAPRType.week]: '7d',
  [EstimatedAPRType.month]: '30d',
  [EstimatedAPRType.all]: 'All',
};

const ESTIMATED_APR_TYPE_LIST = [EstimatedAPRType.week, EstimatedAPRType.month, EstimatedAPRType.all];

export type TPortfolioPositionItemValueProps = {
  tokenInfo: TokenInfo;
  tokenAmount: string;
  tokenAmountInUsd: string;
  tokenPercent: string;
};
export const PortfolioPositionItemValue = ({
  tokenInfo,
  tokenAmount,
  tokenAmountInUsd,
  tokenPercent,
}: TPortfolioPositionItemValueProps) => {
  const isMobile = useMobile();

  return (
    <Row className="portfolio-position-item-value-wrap" justify="space-between" wrap={false} gutter={[8, 0]}>
      <Col>
        <Row gutter={[8, 0]} wrap={false}>
          <Col className="portfolio-position-item-value-logo">
            <CurrencyLogo address={tokenInfo.address} symbol={tokenInfo.symbol} size={isMobile ? 20 : 24} />
          </Col>
          <Col>
            <Font
              size={isMobile ? 14 : 16}
              lineHeight={24}
              weight="medium"
              className="word-break-all">{`${formatTokenAmount(tokenAmount, tokenInfo.decimals)} ${formatSymbol(
              tokenInfo.symbol,
            )}`}</Font>
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[8, 0]} wrap={false}>
          <Col>
            <PriceUSDDigits
              className={getFontStyle({
                lineHeight: 24,
                size: isMobile ? 14 : 16,
                color: 'one',
              })}
              price={tokenAmountInUsd}
            />
          </Col>
          <Col>
            <Font size={isMobile ? 14 : 16} lineHeight={24} color="two">{`${
              formatPercentage(tokenPercent) || '-'
            }%`}</Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export const PortfolioPositionItem = ({ item }: TPortfolioPositionItemProps) => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const [estimatedAPRType, setEstimatedAPRType] = useState<EstimatedAPRType>(EstimatedAPRType.week);

  const [isPriceReverse, setIsPriceReverse] = useState(false);
  const priceLabel = useMemo(() => {
    if (isPriceReverse) {
      const _price = formatPrice(ZERO.plus(item.tradePairInfo.price));

      return `1 ${formatSymbol(item.tradePairInfo.token1.symbol)} = ${_price} ${formatSymbol(
        item.tradePairInfo.token0.symbol,
      )}`;
    } else {
      const _price = formatPrice(ONE.div(item.tradePairInfo.price));

      return `1 ${formatSymbol(item.tradePairInfo.token0.symbol)} = ${_price} ${formatSymbol(
        item.tradePairInfo.token1.symbol,
      )}`;
    }
  }, [isPriceReverse, item.tradePairInfo.price, item.tradePairInfo.token0.symbol, item.tradePairInfo.token1.symbol]);
  const onReversePrice = useCallback(() => {
    setIsPriceReverse((pre) => !pre);
  }, []);

  const routePath = useMemo(() => {
    const pair = item.tradePairInfo;
    if (!pair) return;
    const pairInfoStr = `${pair?.token0?.symbol}_${pair?.token1?.symbol}_${ZERO.plus(pair?.feeRate ?? 0).times(100)}`;
    return `/liquidity/${pairInfoStr}`;
  }, [item.tradePairInfo]);

  const history = useHistory();
  const gotoAddLiquidity = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      history.push(`${routePath}/add`);
    },
    [history, routePath],
  );

  const gotoRemoveLiquidity = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      history.push(`${routePath}/remove`);
    },
    [history, routePath],
  );

  const onAddClick = useLoginCheck(
    {
      checkAccountSync: true,
      redirect: routePath,
    },
    gotoAddLiquidity,
  );

  const onRemoveClick = useLoginCheck(
    {
      checkAccountSync: true,
      redirect: routePath,
    },
    gotoRemoveLiquidity,
  );

  return (
    <div className="portfolio-position-item">
      <div className="portfolio-position-item-header">
        <div className="portfolio-position-item-header-left">
          <div className="portfolio-position-item-pair-info">
            <CurrencyLogos size={24} tokens={[item.tradePairInfo.token0, item.tradePairInfo.token1]} />
            <Pairs
              tokenA={item.tradePairInfo?.token0}
              tokenB={item.tradePairInfo?.token1}
              lineHeight={isMobile ? 24 : 28}
              size={20}
              weight="medium"
            />
            <FeeRate useBg>{formatPercentage(item.tradePairInfo?.feeRate * 100)}</FeeRate>
          </div>

          <div className="portfolio-position-item-price-wrap">
            <Font size={16} lineHeight={24} color="two" className="word-break-all">
              {priceLabel}
            </Font>
            <IconPriceSwitch className="portfolio-position-item-price-switch-btn" onClick={onReversePrice} />
          </div>
        </div>

        <div className="portfolio-position-item-header-right">
          <CommonButton type="ghost" onClick={onAddClick}>
            {`+ ${t('Add Liquidity')}`}
          </CommonButton>
          <CommonButton type="ghost" onClick={onRemoveClick}>
            {t('removeLiquidity')}
          </CommonButton>
        </div>
      </div>

      <div className="portfolio-position-item-content">
        <div className="portfolio-position-item-info portfolio-position-item-left">
          <div className="portfolio-position-item-box">
            <div className="portfolio-position-item-box-header">
              <Font size={16} lineHeight={24} color="two" weight="medium">
                {t('My Position')}
              </Font>

              <PriceUSDDigits
                className={getFontStyle({ lineHeight: 24, size: 16, color: 'one', weight: 'medium' })}
                price={item.position.valueInUsd}
              />
            </div>
            <div className="portfolio-position-item-box-content">
              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token0}
                tokenAmount={item.position.token0Amount}
                tokenAmountInUsd={item.position.token0AmountInUsd}
                tokenPercent={item.position.token0Percent}
              />

              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token1}
                tokenAmount={item.position.token1Amount}
                tokenAmountInUsd={item.position.token1AmountInUsd}
                tokenPercent={item.position.token1Percent}
              />
            </div>
          </div>

          <div className="portfolio-position-item-left-bottom">
            <Row justify="space-between" gutter={[8, 0]} wrap={false}>
              <Col>
                <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24} color="two">
                  {t('My LP Token')}
                </Font>
              </Col>
              <Col>
                <Row gutter={[8, 0]} wrap={false}>
                  <Col>
                    <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24}>{`${formatLiquidity(
                      item.lpTokenAmount,
                    )} LP`}</Font>
                  </Col>
                  <Col>
                    <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24} color="two">
                      {`${
                        ZERO.plus(item.lpTokenPercent).lt(0.01) ? '<0.01' : formatPercentage(item.lpTokenPercent) || '-'
                      }%`}
                    </Font>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row justify="space-between" wrap={false}>
              <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24} color="two">
                {t('Pool Liquidity')}
              </Font>
              <PriceUSDDigits
                className={getFontStyle({ lineHeight: isMobile ? 20 : 24, size: isMobile ? 14 : 16, color: 'one' })}
                price={item.tradePairInfo.tvl}
              />
            </Row>

            <Row justify="space-between" wrap={false}>
              <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24} color="two">
                {t('24h Volume')}
              </Font>
              <PriceUSDDigits
                className={getFontStyle({ lineHeight: isMobile ? 20 : 24, size: isMobile ? 14 : 16, color: 'one' })}
                price={item.tradePairInfo.volume24hInUsd}
              />
            </Row>
          </div>
        </div>

        <div className="portfolio-position-item-info portfolio-position-item-middle">
          <div className="portfolio-position-item-box">
            <div className="portfolio-position-item-box-split" />

            <div className="portfolio-position-item-box-header">
              <Row align="middle" gutter={[4, 0]}>
                <Col>
                  <Font size={16} lineHeight={24} color="two" weight="medium">
                    {t('Fees')}
                  </Font>
                </Col>
                <Col>
                  <CommonTooltip
                    placement="top"
                    title={t('feeDescription')}
                    buttonTitle={t('ok')}
                    headerDesc={t('Fees')}
                  />
                </Col>
              </Row>

              <PriceUSDDigits
                className={getFontStyle({ lineHeight: 24, size: 16, color: 'one', weight: 'medium' })}
                price={item.fee.valueInUsd}
              />
            </div>

            <div className="portfolio-position-item-box-content">
              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token0}
                tokenAmount={item.fee.token0Amount}
                tokenAmountInUsd={item.fee.token0AmountInUsd}
                tokenPercent={item.fee.token0Percent}
              />

              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token1}
                tokenAmount={item.fee.token1Amount}
                tokenAmountInUsd={item.fee.token1AmountInUsd}
                tokenPercent={item.fee.token1Percent}
              />
            </div>
          </div>

          <div className="portfolio-position-item-box">
            <div className="portfolio-position-item-box-header">
              <Row align="middle" gutter={[4, 0]}>
                <Col>
                  <Font size={16} lineHeight={24} color="two" weight="medium">
                    {t('Cumulative net addition')}
                  </Font>
                </Col>
                <Col>
                  <CommonTooltip
                    placement="top"
                    title={t('cumulativeDescription')}
                    buttonTitle={t('ok')}
                    headerDesc={t('Cumulative net addition')}
                  />
                </Col>
              </Row>

              <PriceUSDDigits
                className={getFontStyle({ lineHeight: 24, size: 16, color: 'one', weight: 'medium' })}
                price={item.cumulativeAddition.valueInUsd}
              />
            </div>

            <div className="portfolio-position-item-box-content">
              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token0}
                tokenAmount={item.cumulativeAddition.token0Amount}
                tokenAmountInUsd={item.cumulativeAddition.token0AmountInUsd}
                tokenPercent={item.cumulativeAddition.token0Percent}
              />

              <PortfolioPositionItemValue
                tokenInfo={item.tradePairInfo.token1}
                tokenAmount={item.cumulativeAddition.token1Amount}
                tokenAmountInUsd={item.cumulativeAddition.token1AmountInUsd}
                tokenPercent={item.cumulativeAddition.token1Percent}
              />
            </div>
          </div>
        </div>
        <div className="portfolio-position-item-right">
          <div className="portfolio-position-item-info">
            <div className="portfolio-position-item-switch">
              {ESTIMATED_APR_TYPE_LIST.map((type) => (
                <div
                  key={type}
                  className={clsx(
                    'portfolio-position-item-switch-btn',
                    estimatedAPRType === type && 'portfolio-position-item-switch-btn-active',
                  )}
                  onClick={() => {
                    setEstimatedAPRType(type);
                  }}>
                  <Font size={12} color="two">
                    {t(ESTIMATED_APR_TYPE_LABEL_MAP[type])}
                  </Font>
                </div>
              ))}
            </div>

            <div className="portfolio-position-item-right-box">
              <Row align="middle" gutter={[4, 0]}>
                <Col>
                  <Font size={16} lineHeight={24} color="two" weight="medium">
                    {t('Estimated APR')}
                  </Font>
                </Col>
                <Col>
                  <CommonTooltip
                    placement="top"
                    title={t('estimatedAPRDescription')}
                    buttonTitle={t('ok')}
                    headerDesc={t('Estimated APR')}
                  />
                </Col>
              </Row>

              <Font size={20} lineHeight={28} weight="medium">{`${formatPercentage(
                item.estimatedAPR[estimatedAPRType].percent,
              )}%`}</Font>
            </div>
          </div>

          <div className="portfolio-position-item-info">
            <div className="portfolio-position-item-right-box">
              <Row align="middle" gutter={[4, 0]}>
                <Col>
                  <Font size={16} lineHeight={24} color="two" weight="medium">
                    {t('Dynamic APR')}
                  </Font>
                </Col>
                <Col>
                  <CommonTooltip
                    placement="top"
                    title={t('dynamicAPRDescription')}
                    buttonTitle={t('ok')}
                    headerDesc={t('Dynamic APR')}
                  />
                </Col>
              </Row>

              <Font size={20} lineHeight={28} weight="medium">{`${formatPercentage(item.dynamicAPR)}%`}</Font>
            </div>
            <div className="portfolio-position-item-right-box">
              <Row align="middle" gutter={[4, 0]}>
                <Col>
                  <Font size={16} lineHeight={24} color="two" weight="medium">
                    {t('Impermanent Loss')}
                  </Font>
                </Col>
                <Col>
                  <CommonTooltip
                    placement="top"
                    title={t('impermanentLossDescription')}
                    buttonTitle={t('ok')}
                    headerDesc={t('Impermanent Loss')}
                  />
                </Col>
              </Row>

              <PriceUSDDigits
                className={getFontStyle({ lineHeight: 28, size: 20, color: 'one', weight: 'medium' })}
                price={item.impermanentLossInUSD}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
