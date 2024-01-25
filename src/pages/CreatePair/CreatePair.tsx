import { Col, Row, message } from 'antd';
import { ChainConstants } from 'constants/ChainConstants';
import { useCallback, useMemo, useState } from 'react';
import { useCurrencyBalances } from 'hooks/useBalances';
import SwapRate from 'components/SwapRate';
import { usePair, usePairs } from 'hooks/userPairs';
import { SupportedSwapRate } from 'constants/swap';
import { checkAddButtonStatus, getCurrencyAddress } from 'utils/swap';
import { useActiveWeb3React } from 'hooks/web3';
import { useAddLiquidityInputs, useSelectPair, useTokens } from 'hooks/swap';
import CurrencyInputRow from 'components/CurrencyInputRow';
import { onAddLiquidity, onCreatePair } from 'utils/swapContract';
import { useTranslation } from 'react-i18next';
import { REQ_CODE } from 'constants/misc';

import SelectTokenButton from 'Buttons/SelectTokenButton';
import Font from 'components/Font';
import PriceAdnLiquidityPool from 'components/PriceAndLiquidityPool';
import CommonButton from 'components/CommonButton';
import { useRouterContract } from 'hooks/useContract';
import ApproveButtonsRow, { ApproveButtonsRowState } from 'Buttons/ApproveBtn/ApproveButtonsRow';

export default function CreatePair({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation();

  const { account } = useActiveWeb3React();

  const { leftToken, rightToken, setRightToken, setLeftToken } = useSelectPair(
    ChainConstants.constants.COMMON_BASES[0],
  );

  const currencyBalances = useCurrencyBalances([leftToken, rightToken]);

  const [rate, setRate] = useState<string>(SupportedSwapRate.percent_0_05);

  const [pairs, getPairs] = usePairs(leftToken, rightToken);

  const pairAddress = pairs?.[rate];
  const tokenContractAddress = ChainConstants.constants.TOKEN_CONTRACT;
  const routerAddress = ChainConstants.constants.ROUTER[rate];
  const routerContract = useRouterContract(rate);
  const { reserves } = usePair(pairAddress, routerAddress);

  const tokens = useTokens(leftToken, rightToken);

  const [inputs, onChange, clearInputs] = useAddLiquidityInputs(reserves, tokens);
  const [appoveState, setApproveState] = useState<ApproveButtonsRowState>({
    leftApproved: false,
    rightApproved: false,
    leftApproveRequired: false,
    rightApproveRequired: false,
  });

  const inputDisabled = useMemo(() => {
    return !leftToken || !rightToken;
  }, [leftToken, rightToken]);

  const [loading, setLoading] = useState<boolean>();
  const onChangeLeft = useCallback(
    (val) => {
      onChange(getCurrencyAddress(leftToken), val);
    },
    [leftToken, onChange],
  );
  const onChangeRight = useCallback(
    (val) => {
      onChange(getCurrencyAddress(rightToken), val);
    },
    [onChange, rightToken],
  );
  const [buttonTitle, buttonDisabled] = useMemo(() => {
    return checkAddButtonStatus({
      t,
      leftToken,
      rightToken,
      currencyBalances,
      inputs,
      pairAddress,
    });
  }, [currencyBalances, inputs, leftToken, pairAddress, rightToken, t]);

  const notCreated = useMemo(() => {
    return (
      (ChainConstants.chainType === 'ELF' && !reserves?.[getCurrencyAddress(leftToken)]) ||
      !reserves?.[getCurrencyAddress(rightToken)]
    );
  }, [reserves, leftToken, rightToken]);

  const createCb = useCallback(async () => {
    if (!account || loading) {
      return;
    }

    setLoading(true);

    try {
      if (notCreated) {
        const req = await onCreatePair({
          tokenA: leftToken,
          tokenB: rightToken,
          routerContract,
          account,
          t,
        });

        if (req !== REQ_CODE.Success) {
          return setLoading(false);
        }

        getPairs();
      }

      const req = await onAddLiquidity({
        tokenA: leftToken,
        tokenB: rightToken,
        account,
        inputs,
        routerContract,
        t,
      });

      if (req === REQ_CODE.Success) {
        onCancel();
      } else if (req !== REQ_CODE.UserDenied) {
        clearInputs();
      }
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [account, loading, notCreated, leftToken, rightToken, inputs, routerContract, t, getPairs, onCancel, clearInputs]);

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Row gutter={[12, 8]} wrap>
          <Col span={24}>
            <Font lineHeight={20}>{t('selectPair')}</Font>
          </Col>
          <Col span={12}>
            <SelectTokenButton token={leftToken} setToken={setLeftToken} />
          </Col>
          <Col span={12}>
            <SelectTokenButton token={rightToken} setToken={setRightToken} />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <SwapRate value={rate} pairs={pairs} onChange={setRate} disabled={!leftToken || !rightToken} />
      </Col>
      <Col span={24}>
        <Row gutter={[0, 8]} wrap>
          <Col span={24}>
            <Font lineHeight={20}>{t('depositAmount')}</Font>
          </Col>
          <Col span={24}>
            <CurrencyInputRow
              value={inputs?.[getCurrencyAddress(leftToken)]}
              onChange={onChangeLeft}
              balance={currencyBalances?.[getCurrencyAddress(leftToken)]}
              token={leftToken}
              referToken={rightToken}
              disabled={inputDisabled}
            />
          </Col>
          <Col span={24}>
            <CurrencyInputRow
              value={inputs?.[getCurrencyAddress(rightToken)]}
              balance={currencyBalances?.[getCurrencyAddress(rightToken)]}
              onChange={onChangeRight}
              token={rightToken}
              referToken={leftToken}
              disabled={inputDisabled}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <PriceAdnLiquidityPool leftToken={leftToken} rightToken={rightToken} inputs={inputs} reserves={reserves} />
      </Col>
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
        <Row>
          <CommonButton
            type="primary"
            size="large"
            disabled={
              !!buttonDisabled ||
              !appoveState.leftApproved ||
              !appoveState.rightApproved ||
              appoveState.leftApproveRequired ||
              appoveState.rightApproveRequired
            }
            loading={loading}
            style={{ width: '100%' }}
            ellipsis
            onClick={createCb}>
            {t(`${buttonTitle}`)}
          </CommonButton>
        </Row>
      </Col>
    </Row>
  );
}
