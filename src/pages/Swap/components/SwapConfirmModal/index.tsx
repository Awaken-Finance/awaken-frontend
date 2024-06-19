import Font from 'components/Font';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSymbol } from 'utils/token';
import { Col, Row } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { TSwapInfo } from '../SwapPanel';
import { TSwapRouteInfo } from 'pages/Swap/types';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { ZERO } from 'constants/misc';
import { SwapRouteInfo } from '../SwapRouteInfo';
import { useUserSettings } from 'contexts/useUserSettings';
import { parseUserSlippageTolerance } from 'utils/swap';
import './styles.less';

export type TSwapConfirmModalProps = {
  onCancel?: () => void;
  onConfirm?: (params: {
    swapInfo: TSwapInfo;
    routeInfo: TSwapRouteInfo;
  }) => Promise<boolean | undefined> | boolean | undefined;

  gasFee: string | 0;
  tokenInPrice: string;
  tokenOutPrice: string;
  loading?: boolean;
  //
};

export interface SwapConfirmModalInterface {
  show: (params: { swapInfo: TSwapInfo; routeInfo: TSwapRouteInfo; priceLabel: string }) => void;
}

export const SwapConfirmModal = forwardRef(
  ({ tokenInPrice, tokenOutPrice, gasFee, onConfirm, loading }: TSwapConfirmModalProps, ref) => {
    const { t } = useTranslation();

    const [isVisible, setIsVisible] = useState(false);
    const [swapInfo, setSwapInfo] = useState<TSwapInfo>();
    const [routeInfo, setRouteInfo] = useState<TSwapRouteInfo>();
    const [priceLabel, setPriceLabel] = useState('');

    const [{ userSlippageTolerance }] = useUserSettings();
    const slippageValue = useMemo(() => {
      return ZERO.plus(parseUserSlippageTolerance(userSlippageTolerance)).dp(2).toString();
    }, [userSlippageTolerance]);

    const show = useCallback<SwapConfirmModalInterface['show']>(({ swapInfo, routeInfo, priceLabel }) => {
      setSwapInfo(JSON.parse(JSON.stringify(swapInfo)));
      setRouteInfo(JSON.parse(JSON.stringify(routeInfo)));
      setPriceLabel(priceLabel);
      setIsVisible(true);
    }, []);
    useImperativeHandle(ref, () => ({ show }));

    const onCancel = useCallback(() => {
      setIsVisible(false);
      setSwapInfo(undefined);
      setRouteInfo(undefined);
      setPriceLabel('');
    }, []);

    const onConfirmClick = useCallback(async () => {
      if (!swapInfo || !routeInfo) return;

      try {
        const result = await onConfirm?.({
          swapInfo,
          routeInfo,
        });
        if (result) onCancel();
      } catch (error) {
        console.log('onConfirmClick error', error);
      }
    }, [onCancel, onConfirm, routeInfo, swapInfo]);

    const priceIn = useMemo(
      () =>
        ZERO.plus(swapInfo?.valueIn || 0)
          .times(tokenInPrice)
          .dp(2)
          .toFixed(),
      [swapInfo?.valueIn, tokenInPrice],
    );

    const priceOut = useMemo(
      () =>
        ZERO.plus(swapInfo?.valueOut || 0)
          .times(tokenOutPrice)
          .dp(2)
          .toFixed(),
      [swapInfo?.valueOut, tokenOutPrice],
    );

    return (
      <CommonModal
        width="420px"
        height="522px"
        showType="modal"
        showBackIcon={false}
        closable={true}
        centered={true}
        visible={isVisible}
        title={t('Receive Swap')}
        className={'swap-confirm-modal'}
        onCancel={onCancel}>
        <div className="swap-confirm-modal-content">
          <div className="swap-confirm-modal-input-wrap">
            <div className="swap-confirm-modal-input-info">
              <Font size={14} lineHeight={22} color="two">
                {t('Pay')}
              </Font>
              <Font size={24} lineHeight={32}>{`${swapInfo?.valueIn} ${formatSymbol(swapInfo?.tokenIn?.symbol)}`}</Font>
              <Font size={14} lineHeight={22} color="two">
                {`$${priceIn}`}
              </Font>
            </div>
            <CurrencyLogo size={36} currency={swapInfo?.tokenIn} />
          </div>
          <div className="swap-confirm-modal-input-wrap">
            <div className="swap-confirm-modal-input-info">
              <Font size={14} lineHeight={22} color="two">
                {t('Receive')}
              </Font>
              <Font size={24} lineHeight={32}>{`${swapInfo?.valueOut} ${formatSymbol(
                swapInfo?.tokenOut?.symbol,
              )}`}</Font>
              <Font size={14} lineHeight={22} color="two">
                {`$${priceOut}`}
              </Font>
            </div>
            <CurrencyLogo size={36} currency={swapInfo?.tokenOut} />
          </div>

          <div className="swap-confirm-modal-detail">
            <Row align={'middle'} justify={'space-between'}>
              <Col className="swap-detail-title">
                <Font color="two" size={14} lineHeight={22}>
                  {t('Rate')}
                </Font>
              </Col>

              <Row gutter={[4, 0]} align="middle">
                <Col>
                  <Font size={14} lineHeight={22}>
                    {priceLabel}
                  </Font>
                </Col>
              </Row>
            </Row>

            <Row align={'middle'} justify={'space-between'}>
              <Col className="swap-detail-title">
                <Font color="two" size={14} lineHeight={22}>
                  {t('slippageTolerance')}
                </Font>
              </Col>

              <Row gutter={[4, 0]} align="middle">
                <Col>
                  <Font size={14} lineHeight={22} suffix="%">
                    {slippageValue}
                  </Font>
                </Col>
              </Row>
            </Row>

            {routeInfo && swapInfo && (
              <SwapRouteInfo
                isTipShow={false}
                isRoutingShow={false}
                swapInfo={swapInfo}
                routeInfo={routeInfo}
                gasFee={gasFee}
              />
            )}
          </div>
        </div>
        <CommonButton onClick={onConfirmClick} loading={loading} className="swap-confirm-modal-btn" type="primary">
          {t('Swap')}
        </CommonButton>
      </CommonModal>
    );
  },
);
