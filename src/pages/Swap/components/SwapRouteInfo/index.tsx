import { Col, Row } from 'antd';
import CommonTooltip from 'components/CommonTooltip';
import Font from 'components/Font';
import { TSwapRoute } from 'pages/Swap/types';
import { Trans, useTranslation } from 'react-i18next';
import { useUserSettings } from 'contexts/useUserSettings';
import { useMemo } from 'react';
import { bigNumberToString, getPriceImpactWithBuy, minimumAmountOut } from 'utils/swap';
import { TEN_THOUSAND, ZERO } from 'constants/misc';
import BigNumber from 'bignumber.js';
import { divDecimals } from 'utils/calculate';
import { SwapOrderRouting } from '../SwapOrderRouting';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Currency } from '@awaken/sdk-core';
import { TSwapInfo } from '../SwapPanel';
import { formatSymbol } from 'utils/token';
import './styles.less';
import { SWAP_LABS_FEE_RATE, SWAP_RECEIVE_RATE } from 'constants/swap';

export type TSwapRouteInfoProps = {
  swapInfo: TSwapInfo;
  swapRoute?: TSwapRoute;
  gasFee: number;
  isTipShow?: boolean;
  isRoutingShow?: boolean;
};

export const SwapRouteInfo = ({
  swapInfo,
  swapRoute,
  gasFee,
  isTipShow = true,
  isRoutingShow = true,
}: TSwapRouteInfoProps) => {
  const { t } = useTranslation();
  const [{ userSlippageTolerance }] = useUserSettings();

  const amountOutMinValue = useMemo(() => {
    const { valueOut, tokenOut } = swapInfo;
    if (!valueOut || !tokenOut) return '-';
    const _value = bigNumberToString(minimumAmountOut(ZERO.plus(valueOut), userSlippageTolerance), tokenOut.decimals);
    return `${_value} ${formatSymbol(tokenOut.symbol)}`;
  }, [swapInfo, userSlippageTolerance]);

  const priceImpact = useMemo(() => {
    if (!swapRoute) return '-';

    const impactList: BigNumber[] = [];
    swapRoute.distributions.forEach((path) => {
      for (let i = 0; i < path.tokens.length - 1; i++) {
        const tradePairExtension = path.tradePairExtensions[i];
        const tradePair = path.tradePairs[i];
        const tokenIn = path.tokens[i];
        const tokenOut = path.tokens[i + 1];
        let tokenInReserve = ZERO.plus(tradePairExtension.valueLocked0);
        let tokenOutReserve = ZERO.plus(tradePairExtension.valueLocked1);
        if (tokenIn.symbol !== tradePair.token0.symbol) {
          tokenInReserve = ZERO.plus(tradePairExtension.valueLocked1);
          tokenOutReserve = ZERO.plus(tradePairExtension.valueLocked0);
        }

        const valueIn = divDecimals(path.amounts[i], tokenIn.decimals);
        const valueOut = divDecimals(path.amounts[i + 1], tokenOut.decimals);

        const _impact = getPriceImpactWithBuy(tokenOutReserve, tokenInReserve, valueIn, valueOut);
        impactList.push(_impact);
      }
    });

    return `${bigNumberToString(BigNumber.max(...impactList), 2)}%`;
  }, [swapRoute]);

  const feeValue = useMemo(() => {
    if (!swapInfo.tokenOut) return '-';
    const _symbol = formatSymbol(swapInfo.tokenOut.symbol);
    if (!swapInfo.valueOut) return `- ${_symbol}`;

    return `${ZERO.plus(swapInfo.valueOut)
      .div(SWAP_RECEIVE_RATE)
      .times(SWAP_LABS_FEE_RATE)
      .div(TEN_THOUSAND)
      .dp(swapInfo.tokenOut?.decimals || 1, BigNumber.ROUND_DOWN)
      .toFixed()} ${_symbol}`;
  }, [swapInfo]);

  const gasFeeValue = useMemo(() => {
    return divDecimals(ZERO.plus(gasFee), 8);
  }, [gasFee]);

  const currencyLogoTokens = useMemo(() => {
    const { tokenIn, tokenOut } = swapInfo;
    return [tokenIn, tokenOut].filter((item) => !!item) as Currency[];
  }, [swapInfo]);

  return (
    <>
      <Row align={'middle'} justify={'space-between'}>
        <Col className="swap-route-info-title">
          <Font color="two" size={14} lineHeight={22}>
            {t('minEaring')}
          </Font>
          {isTipShow && (
            <CommonTooltip
              placement="top"
              title={t(
                'Min.Received refers to the exchange result at the price corresponding to the Max.Slippage you set.Generally, it will be more.',
              )}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('minEaring')}
            />
          )}
        </Col>

        <Col>
          <Font size={14} lineHeight={22}>
            {amountOutMinValue}
          </Font>
        </Col>
      </Row>

      <Row align={'middle'} justify={'space-between'}>
        <Col className="swap-route-info-title">
          <Font color="two" size={14} lineHeight={22}>
            {t('priceSlippage')}
          </Font>
          {isTipShow && (
            <CommonTooltip
              placement="top"
              title={t(
                'The maximum impact on the currency price of the liquidity pool after the transaction is completed.',
              )}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('priceSlippage')}
            />
          )}
        </Col>

        <Col>
          <Font size={14} lineHeight={22}>
            {priceImpact}
          </Font>
        </Col>
      </Row>

      <Row align={'middle'} justify={'space-between'}>
        <Col className="swap-route-info-title">
          <Font color="two" size={14} lineHeight={22}>
            {t('Fee')}
          </Font>
          {isTipShow && (
            <CommonTooltip
              placement="top"
              title={
                <div className="fee-description-wrap">
                  <Trans i18nKey="feeDescription" components={{ a: <a /> }} />
                </div>
              }
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('Fee')}
            />
          )}
        </Col>

        <Col>
          <Font size={14} lineHeight={22}>
            {feeValue}
          </Font>
        </Col>
      </Row>

      <Row align={'middle'} justify={'space-between'}>
        <Col className="swap-route-info-title">
          <Font color="two" size={14} lineHeight={22}>
            {t('transactionFee')}
          </Font>

          {isTipShow && (
            <CommonTooltip
              placement="top"
              title={t('transactionFeeDescription')}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('transactionFee')}
            />
          )}
        </Col>

        <Col>
          <Font size={14} lineHeight={22}>
            {`${gasFeeValue} ELF`}
          </Font>
        </Col>
      </Row>

      {isRoutingShow && (
        <Row align={'middle'} justify={'space-between'}>
          <Col className="swap-route-info-title">
            <Font color="two" size={14} lineHeight={22}>
              {t('Order Routing')}
            </Font>

            {isTipShow && (
              <CommonTooltip
                placement="top"
                title={t(
                  `Awaken's order routing selects the swap path with the lowest comprehensive cost to complete the transaction and increase the amount you receive.`,
                )}
                getPopupContainer={(v) => v}
                buttonTitle={t('ok')}
                headerDesc={t('Order Routing')}
              />
            )}
          </Col>

          <Col className="swap-order-routing-tip-wrap">
            <CommonTooltip
              width={'400px'}
              placement="top"
              title={<SwapOrderRouting swapRoute={swapRoute} />}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('Order Routing')}>
              <CurrencyLogos size={20} tokens={currencyLogoTokens} isSortToken={false} />
            </CommonTooltip>
          </Col>
        </Row>
      )}
    </>
  );
};
