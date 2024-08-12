import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { formatSymbol } from 'utils/token';
import { Col, Row } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';

import './styles.less';
import { useActiveWeb3React } from 'hooks/web3';
import { sleep } from 'utils';
import { useMobile } from 'utils/isMobile';
import Font from 'components/Font';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { useTransactionFeeStr } from 'contexts/useStore/hooks';
import { Currency } from '@awaken/sdk-core';
import { ExpiryEnum } from 'pages/Exchange/components/ExchangeContainer/components/LimitCard/components/LimitExpiry';
import { useTokenPrice } from 'contexts/useTokenPrice/hooks';
import { REQ_CODE, ZERO } from 'constants/misc';
import moment from 'moment';
import useAllowanceAndApprove from 'hooks/useApprove';
import { ChainConstants } from 'constants/ChainConstants';
import { getCurrencyAddress, getDeadlineWithTime } from 'utils/swap';
import { useAElfContract } from 'hooks/useContract';
import { LIMIT_CONTRACT_ADDRESS, SWAP_HOOK_CONTRACT_ADDRESS } from 'constants/index';
import { timesDecimals } from 'utils/calculate';
import { commitLimit, getContractMaxPrice } from 'utils/limit';
import { LIMIT_MAX_BUFFER_RATIO, LIMIT_PRICE_DECIMAL } from 'constants/limit';

export type TLimitConfirmModalProps = {
  onSuccess?: () => void;
};

export type TLimitConfirmModalInfo = {
  tokenIn: Currency;
  tokenOut: Currency;
  amountIn: string;
  amountOut: string;
  expiryValue: ExpiryEnum;
  isPriceReverse?: boolean;
};
export interface LimitConfirmModalInterface {
  show: (params: TLimitConfirmModalInfo) => void;
}

export const LimitConfirmModal = forwardRef(({ onSuccess }: TLimitConfirmModalProps, ref) => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const transactionFeeStr = useTransactionFeeStr();

  const [isVisible, setIsVisible] = useState(false);
  const [info, setInfo] = useState<TLimitConfirmModalInfo>();
  const tokenInPrice = useTokenPrice({ symbol: info?.tokenIn.symbol });
  const tokenOutPrice = useTokenPrice({ symbol: info?.tokenOut.symbol });
  const [expiryTime, setExpiryTime] = useState(0);

  const expiryTimeStr = useMemo(() => moment.unix(expiryTime).format('MMMM DD, YYYY [at] h:mm A'), [expiryTime]);

  const priceIn = useMemo(() => {
    if (tokenInPrice === '0') return '-';
    const _priceBN = ZERO.plus(info?.amountIn || 0).times(tokenInPrice);
    if (_priceBN.lt(0.01)) return '< $0.01';
    return `$${_priceBN.toFixed(2)}`;
  }, [info?.amountIn, tokenInPrice]);

  const priceOut = useMemo(() => {
    if (tokenOutPrice === '0') return '-';
    const _priceBN = ZERO.plus(info?.amountOut || 0).times(tokenOutPrice);
    if (_priceBN.lt(0.01)) return '< $0.01';
    return `$${_priceBN.toFixed(2)}`;
  }, [info?.amountOut, tokenOutPrice]);

  const price = useMemo(() => {
    if (info?.isPriceReverse) {
      return `1 ${formatSymbol(info?.tokenIn.symbol)} = ${ZERO.plus(info?.amountOut || 0)
        .div(info?.amountIn || 1)
        .toFixed(LIMIT_PRICE_DECIMAL)} ${formatSymbol(info?.tokenOut.symbol)}`;
    }
    return `1 ${formatSymbol(info?.tokenOut.symbol)} = ${ZERO.plus(info?.amountIn || 0)
      .div(info?.amountOut || 1)
      .toFixed(LIMIT_PRICE_DECIMAL)} ${formatSymbol(info?.tokenIn.symbol)}`;
  }, [info?.amountIn, info?.amountOut, info?.isPriceReverse, info?.tokenIn.symbol, info?.tokenOut.symbol]);

  const show = useCallback<LimitConfirmModalInterface['show']>(async (info) => {
    setInfo(info);
    setExpiryTime(moment().add(info.expiryValue, 'days').unix());
    await sleep(100);
    setIsVisible(true);
  }, []);
  useImperativeHandle(ref, () => ({ show }));

  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const onCancel = useCallback(() => {
    if (isLoadingRef.current) return;
    setIsVisible(false);
  }, []);

  const { account } = useActiveWeb3React();
  const limitContract = useAElfContract(LIMIT_CONTRACT_ADDRESS);
  const hookContract = useAElfContract(SWAP_HOOK_CONTRACT_ADDRESS);

  const tokenInAddress = useMemo(() => getCurrencyAddress(info?.tokenIn), [info?.tokenIn]);
  const { approve, checkAllowance } = useAllowanceAndApprove(
    ChainConstants.constants.TOKEN_CONTRACT,
    tokenInAddress,
    account || undefined,
    limitContract?.address,
  );
  const onConfirmClick = useCallback(async () => {
    if (!info || !limitContract || !hookContract) return;
    setIsLoading(true);
    isLoadingRef.current = true;
    try {
      const { amountIn, amountOut, tokenIn, tokenOut } = info;
      const maxPrice = await getContractMaxPrice({
        contract: hookContract,
        tokenIn,
        tokenOut,
      });

      const curPrice = ZERO.plus(amountIn).div(amountOut);
      const maxBufferPrice = ZERO.plus(maxPrice).times(LIMIT_MAX_BUFFER_RATIO);
      if (curPrice.gt(maxBufferPrice)) {
        // TODO: 300
        setIsLoading(false);
        isLoadingRef.current = false;
        return;
      }

      const valueInAmountBN = timesDecimals(amountIn, tokenIn.decimals);
      // TODO: 300
      const allowance = await checkAllowance();
      if (valueInAmountBN.gt(allowance)) {
        await approve(valueInAmountBN);
      }

      const args = {
        amountIn: timesDecimals(amountIn, tokenIn.decimals).toFixed(),
        symbolIn: tokenIn.symbol,
        amountOut: timesDecimals(amountOut, tokenOut.decimals).toFixed(),
        symbolOut: tokenOut.symbol,
        deadline: getDeadlineWithTime(expiryTime),
      };
      console.log('commitLimit', args);
      const req = await commitLimit({
        contract: limitContract,
        account,
        t,
        args,
      });
      if (req !== REQ_CODE.UserDenied) {
        isLoadingRef.current = false;
        onSuccess?.();
        onCancel();
        return true;
      }
    } catch (error) {
      console.log('LimitConfirmModal error', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [info, limitContract, hookContract, checkAllowance, expiryTime, account, t, approve, onSuccess, onCancel]);

  return (
    <CommonModal
      width="420px"
      height={isMobile ? '100vh' : '522px'}
      showType={isMobile ? 'drawer' : 'modal'}
      showBackIcon={false}
      closable={true}
      centered={true}
      visible={isVisible}
      title={t('Review Limit')}
      className={'limit-confirm-modal'}
      onCancel={onCancel}>
      <div className="limit-confirm-modal-content">
        <div className="limit-confirm-modal-input-wrap">
          <div className="limit-confirm-modal-input-info">
            <Font size={14} lineHeight={22} color="two">
              {t('Pay')}
            </Font>
            <Font size={24} lineHeight={32}>
              {`${info?.amountIn} ${formatSymbol(info?.tokenIn.symbol)}`}
            </Font>
            <Font size={14} lineHeight={22} color="two">
              {priceIn}
            </Font>
          </div>
          <CurrencyLogo size={36} currency={info?.tokenIn} />
        </div>
        <div className="limit-confirm-modal-input-wrap">
          <div className="limit-confirm-modal-input-info">
            <Font size={14} lineHeight={22} color="two">
              {t('Receive')}
            </Font>
            <Font size={24} lineHeight={32}>{`${info?.amountOut} ${formatSymbol(info?.tokenOut.symbol)}`}</Font>
            <Font size={14} lineHeight={22} color="two">
              {priceOut}
            </Font>
          </div>
          <CurrencyLogo size={36} currency={info?.tokenOut} />
        </div>

        <div className="limit-confirm-modal-detail">
          <Row align={'middle'} justify={'space-between'}>
            <Col className="limit-detail-title">
              <Font color="two" size={14} lineHeight={22}>
                {t('Limit Price')}
              </Font>
            </Col>

            <Row gutter={[4, 0]} align="middle">
              <Col>
                <Font size={14} lineHeight={22}>
                  {price}
                </Font>
              </Col>
            </Row>
          </Row>

          <Row align={'middle'} justify={'space-between'}>
            <Col className="limit-detail-title">
              <Font color="two" size={14} lineHeight={22}>
                {t('Expiry')}
              </Font>
            </Col>

            <Row gutter={[4, 0]} align="middle">
              <Col>
                <Font size={14} lineHeight={22}>
                  {expiryTimeStr}
                </Font>
              </Col>
            </Row>
          </Row>

          <Row align={'middle'} justify={'space-between'}>
            <Col className="limit-detail-title">
              <Font color="two" size={14} lineHeight={22}>
                {t('Fee')}
              </Font>
            </Col>

            <Row gutter={[4, 0]} align="middle">
              <Col>
                <Font size={14} lineHeight={22}>
                  {'0 ELF'}
                </Font>
              </Col>
            </Row>
          </Row>

          <Row align={'middle'} justify={'space-between'}>
            <Col className="limit-detail-title">
              <Font color="two" size={14} lineHeight={22}>
                {t('Network Cost')}
              </Font>
            </Col>

            <Row gutter={[4, 0]} align="middle">
              <Col>
                <Font size={14} lineHeight={22}>
                  {`${transactionFeeStr} ELF`}
                </Font>
              </Col>
            </Row>
          </Row>
        </div>
      </div>
      <div className="limit-confirm-modal-notice">
        <Font size={14} lineHeight={22} color="one">
          {t('Notice')}
        </Font>
        <div className="limit-confirm-modal-notice-content">
          <Trans
            i18nKey="noticeContent1"
            values={{
              orderNum: 1,
              remainAmount: `100 ${formatSymbol(info?.tokenIn.symbol)}`,
              currentAmount: `200 ${formatSymbol(info?.tokenIn.symbol)}`,
              requireAmount: `300 ${formatSymbol(info?.tokenIn.symbol)}`,
            }}
            components={{ span: <span /> }}
          />
        </div>
        <div className="limit-confirm-modal-notice-content">
          {t(
            '· Please keep your wallet balance sufficient, and do not modify the authorization amount by yourself, otherwise the transaction will fail.',
          )}
        </div>
      </div>
      <CommonButton onClick={onConfirmClick} loading={isLoading} className="limit-confirm-modal-btn" type="primary">
        {t('Place Order')}
      </CommonButton>
    </CommonModal>
  );
});
