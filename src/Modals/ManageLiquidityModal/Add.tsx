import { Col, Row, message } from 'antd';
import CurrencyInputRow from 'components/CurrencyInputRow';
import { ChainConstants } from 'constants/ChainConstants';
import { SupportedSwapRate, SupportedSwapRateMap } from 'constants/swap';
import { useAddLiquidityInputs, useSelectPair, useTokens } from 'hooks/swap';
import { useCurrencyBalances } from 'hooks/useBalances';
import { usePair, usePairsAddress } from 'hooks/userPairs';
import { useActiveWeb3React } from 'hooks/web3';
import { useCallback, useMemo, useState } from 'react';
import { getCurrencyAddress, getEstimatedShare, getLiquidity } from 'utils/swap';
import { onAddLiquidity, onCreatePair } from 'utils/swapContract';
import { checkAddButtonStatus } from 'utils/swap';
import { useTranslation } from 'react-i18next';
import { REQ_CODE, ZERO } from 'constants/misc';
import PriceAdnLiquidityPool from 'components/PriceAndLiquidityPool';
import HoldLiquidity from './HoldLiquidity';
import { getTransactionFee } from 'pages/Exchange/apis/getTransactionFee';
import { useDebounceFn, useRequest } from 'ahooks';
import { useRouterContract } from 'hooks/useContract';
import CommonButton from 'components/CommonButton';

import './styles.less';
import ApproveButtonsRow, { ApproveButtonsRowState } from 'Buttons/ApproveBtn/ApproveButtonsRow';
import { AddConfirmModal } from './AddConfirmModals';
import { PairInfo } from 'contexts/useModal/actions';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import { isNFTSymbol } from 'utils/reg';

export default function Add({ pairInfo }: { pairInfo: PairInfo }) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);

  const { tokenA, tokenB, feeRate } = pairInfo || {};
  const rate = feeRate ? SupportedSwapRateMap[feeRate] : SupportedSwapRate.percent_0_05;
  const { leftToken, rightToken } = useSelectPair(tokenA || ChainConstants.constants.COMMON_BASES[0], tokenB);
  const { data: transactionFee = 0 } = useRequest(getTransactionFee);

  const currencyBalances = useCurrencyBalances([leftToken, rightToken]);
  const routerContract = useRouterContract(rate);

  const pairAddress = usePairsAddress(rate, leftToken, rightToken);
  const tokenContractAddress = ChainConstants.constants.TOKEN_CONTRACT;

  const routerAddress = ChainConstants.constants.ROUTER[rate];

  const { reserves, totalSupply } = usePair(pairAddress, routerAddress);

  const tokens = useTokens(leftToken, rightToken);

  const [inputs, onChange, clearInputs] = useAddLiquidityInputs(reserves, tokens);
  const [appoveState, setApproveState] = useState<ApproveButtonsRowState>({
    leftApproved: false,
    rightApproved: false,
    leftApproveRequired: false,
    rightApproveRequired: false,
  });

  const [loading, setLoading] = useState<boolean>();

  const onChangeLeft = useCallback(
    (val: string) => {
      onChange(getCurrencyAddress(leftToken), val);
    },
    [leftToken, onChange],
  );
  const onChangeRight = useCallback(
    (val: string) => {
      onChange(getCurrencyAddress(rightToken), val);
    },
    [onChange, rightToken],
  );
  const [buttonTitle, buttonDisabled] = checkAddButtonStatus({
    t,
    leftToken,
    rightToken,
    currencyBalances,
    inputs,
    pairAddress,
  });

  const shareOfPool = `${getEstimatedShare({ inputs, reserves, tokens })}%`;

  const notCreated = useMemo(() => {
    return (
      (ChainConstants.chainType === 'ELF' && !reserves?.[getCurrencyAddress(leftToken)]) ||
      !reserves?.[getCurrencyAddress(rightToken)]
    );
  }, [reserves, leftToken, rightToken]);

  const addCb = async () => {
    if (!account || loading) {
      return;
    }

    setLoading(true);

    try {
      if (notCreated) {
        const req = await onCreatePair({
          tokenA: leftToken,
          tokenB: rightToken,
          account,
          routerContract,
          t,
        });

        if (req !== REQ_CODE.Success) {
          return setLoading(false);
        }
      }

      const req = await onAddLiquidity({
        tokenA: leftToken,
        tokenB: rightToken,
        account,
        inputs,
        routerContract,
        t,
      });

      if (req !== REQ_CODE.UserDenied) {
        clearInputs();
      }
    } catch (error: any) {
      console.error(error);
      message.error(t('AddLiquidityFailed'));
    } finally {
      setLoading(false);
    }
  };

  const { run: maxCallback } = useDebounceFn(
    () => {
      let availableLeftToken = currencyBalances?.[getCurrencyAddress(leftToken)],
        availabRightftToken = currencyBalances?.[getCurrencyAddress(rightToken)];

      const fee = new BigNumber(transactionFee);

      if (leftToken?.symbol === 'ELF') {
        availableLeftToken = availableLeftToken.gt(fee) ? availableLeftToken.minus(fee) : ZERO;
      }

      if (rightToken?.symbol === 'ELF') {
        availabRightftToken = availabRightftToken.gt(fee) ? availabRightftToken.minus(fee) : ZERO;
      }

      const leftTokenMaxLp = getLiquidity(availableLeftToken, reserves?.[getCurrencyAddress(leftToken)], totalSupply);
      const rightTokenMaxLp = getLiquidity(
        availabRightftToken,
        reserves?.[getCurrencyAddress(rightToken)],
        totalSupply,
      );

      if (leftTokenMaxLp.lt(rightTokenMaxLp)) {
        onChangeLeft(divDecimals(availableLeftToken, leftToken?.decimals).toFixed());
      } else {
        onChangeRight(divDecimals(availabRightftToken, rightToken?.decimals).toFixed());
      }
    },
    {
      wait: 100,
    },
  );

  const showMax = useMemo(() => {
    if (
      !currencyBalances?.[getCurrencyAddress(leftToken)] ||
      !currencyBalances?.[getCurrencyAddress(rightToken)] ||
      currencyBalances?.[getCurrencyAddress(leftToken)]?.isZero() ||
      currencyBalances?.[getCurrencyAddress(rightToken)]?.isZero() ||
      !reserves?.[getCurrencyAddress(leftToken)] ||
      !reserves?.[getCurrencyAddress(rightToken)] ||
      new BigNumber(reserves?.[getCurrencyAddress(leftToken)]).isZero() ||
      new BigNumber(reserves?.[getCurrencyAddress(rightToken)]).isZero()
    ) {
      return false;
    }
    return true;
  }, [currencyBalances, leftToken, reserves, rightToken]);

  const disabledTokenB = useMemo(() => {
    return isNFTSymbol(tokenA?.symbol) && !isNFTSymbol(tokenB?.symbol);
  }, [tokenA?.symbol, tokenB?.symbol]);

  const disabledTokenA = useMemo(() => {
    return !isNFTSymbol(tokenA?.symbol) && isNFTSymbol(tokenB?.symbol);
  }, [tokenA?.symbol, tokenB?.symbol]);

  return (
    <Row gutter={[0, 16]} className="add-modal-box">
      <HoldLiquidity leftToken={leftToken} rightToken={rightToken} rate={rate} reserves={reserves} />

      <Col span={24}>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <CurrencyInputRow
              value={inputs?.[getCurrencyAddress(leftToken)]}
              onChange={onChangeLeft}
              balance={currencyBalances?.[getCurrencyAddress(leftToken)]}
              token={leftToken}
              referToken={rightToken}
              showMax={showMax}
              maxCallback={maxCallback}
              disabled={disabledTokenA}
            />
          </Col>
          <Col span={24}>
            <CurrencyInputRow
              value={inputs?.[getCurrencyAddress(rightToken)]}
              onChange={onChangeRight}
              balance={currencyBalances?.[getCurrencyAddress(rightToken)]}
              token={rightToken}
              referToken={leftToken}
              disabled={disabledTokenB}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <PriceAdnLiquidityPool leftToken={leftToken} rightToken={rightToken} reserves={reserves} inputs={inputs} />
      </Col>
      <Col span={24}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <ApproveButtonsRow
              leftToken={leftToken}
              rightToken={rightToken}
              routerAddress={routerAddress}
              tokenContractAddress={tokenContractAddress}
              inputs={inputs}
              onApproveStateChange={setApproveState}
            />
          </Col>
          <Col span={24}>
            <CommonButton
              type="primary"
              size="large"
              loading={loading}
              disabled={
                !!buttonDisabled ||
                !appoveState.leftApproved ||
                !appoveState.rightApproved ||
                appoveState.leftApproveRequired ||
                appoveState.rightApproveRequired
              }
              onClick={() => setConfirmVisible(true)}
              className="comfirm-btn">
              {t(`${buttonTitle}`)}
            </CommonButton>
          </Col>
        </Row>
      </Col>
      <AddConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        tokenA={tokenA}
        tokenB={tokenB}
        rate={rate}
        shareOfPool={shareOfPool}
        tokenAValue={inputs?.[getCurrencyAddress(leftToken)] || '0'}
        tokenBValue={inputs?.[getCurrencyAddress(rightToken)] || '0'}
        onConfirm={() => {
          setConfirmVisible(false);
          addCb();
        }}
      />
    </Row>
  );
}
