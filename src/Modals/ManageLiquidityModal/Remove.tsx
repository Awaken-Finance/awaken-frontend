import { Col, InputRef, Row } from 'antd';
import { ChainConstants } from 'constants/ChainConstants';
import { SupportedSwapRate, SupportedSwapRateMap } from 'constants/swap';
import { useRemoveLiquidityInputs, useSelectPair, useTokens } from 'hooks/swap';
import { useBalances } from 'hooks/useBalances';
import { usePair, usePairsAddress } from 'hooks/userPairs';
import { useActiveWeb3React } from 'hooks/web3';
import { useMemo, useRef, useState } from 'react';
import { RemoveOutputs } from 'types/swap';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { getCurrencyAddress, getLPDecimals } from 'utils/swap';
import { onRemoveLiquidity } from 'utils/swapContract';
import { checkRemoveButtonStatus } from 'utils/swap';
import { getELFChainTokenURL, unitConverter } from 'utils';
import { useTranslation } from 'react-i18next';
import { REQ_CODE } from 'constants/misc';

import { isValidNumber } from 'utils/reg';
import CommonInput from 'components/CommonInput';
import CommonSlider from 'components/CommonSlider';
import { CurrencyLogos, CurrencyLogo } from 'components/CurrencyLogo';
import { Pairs, Pair } from 'components/Pair';
import Font from 'components/Font';
import PriceAdnLiquidityPool from 'components/PriceAndLiquidityPool';
import CommonTooltip from 'components/CommonTooltip';

import CommonButton from 'components/CommonButton';
import { useRouterContract } from 'hooks/useContract';
import { PooledTokensModal, RemoveConfirmModal } from './RemoveConfirmModals';
import useAllowanceAndApprove from 'hooks/useApprove';
import BigNumber from 'bignumber.js';
import useLPSymbol from 'hooks/useLPSymbol';
import { useMobile } from 'utils/isMobile';
import { PairInfo } from 'contexts/useModal/actions';

import './styles.less';
import CommonBlockProgress from 'components/CommonBlockProgress';

export default function Remove({ pairInfo }: { pairInfo: PairInfo }) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const { account } = useActiveWeb3React();
  const [pooledTokensVisible, setPooledTokensVisible] = useState<boolean>(false);
  const [removeConfirmVisible, setRemoveConfirmVisible] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [tmpInput, setTmpInput] = useState<RemoveOutputs>();

  const inputRef = useRef<InputRef>(null);

  const { tokenA, tokenB, feeRate } = pairInfo || {};
  const { leftToken, rightToken } = useSelectPair(tokenA || ChainConstants.constants.COMMON_BASES[0], tokenB);
  const rate = feeRate ? SupportedSwapRateMap[feeRate] : SupportedSwapRate.percent_0_05;

  const lpTokenContractAddress = ChainConstants.constants.FACTORY[rate];
  const pairAddress = usePairsAddress(rate, leftToken, rightToken);
  const [bs] = useBalances(pairAddress, undefined, rate);
  const lpBalance = bs[0];

  const showLpBalance = divDecimals(lpBalance, getLPDecimals());

  const routerAddress = ChainConstants.constants.ROUTER[rate];
  const routerContract = useRouterContract(rate);
  const lpSymbol = useLPSymbol(tokenA, tokenB);

  const { checkAllowance, approve } = useAllowanceAndApprove(
    lpTokenContractAddress,
    lpSymbol,
    account || undefined,
    routerAddress,
  );

  const { reserves, totalSupply } = usePair(pairAddress, routerAddress);

  const tokens = useTokens(leftToken, rightToken);
  const [progress, setProgress] = useState(0);
  const [inputs, onChange, clearInputs] = useRemoveLiquidityInputs(lpBalance, reserves, totalSupply, tokens);

  const liquidity = useMemo(() => {
    return timesDecimals(inputs?.['lp'], getLPDecimals());
  }, [inputs]);

  const [buttonTitle, buttonDisabled] = checkRemoveButtonStatus({
    leftToken,
    rightToken,
    inputs,
    pairAddress,
    showLpBalance,
  });

  const inputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value && !isValidNumber(event.target.value)) {
      return;
    }
    setProgress(0);
    onChange && onChange('lp', event.target.value);
  };

  const removeCb = async () => {
    if (!account || !inputs || !pairAddress || !!tmpInput) {
      return;
    }

    setLoading(true);

    try {
      setTmpInput(inputs);

      const allowance = await checkAllowance();
      const allowanceBN = new BigNumber(allowance);

      if (allowanceBN.lt(liquidity)) {
        await approve(liquidity);
      }

      const req = await onRemoveLiquidity({
        lpAddress: pairAddress,
        account,
        routerContract,
        tokenA: leftToken,
        tokenB: rightToken,
        inputs,
        awTokenAddress: ChainConstants.constants.FACTORY[rate],
        t,
      });

      if (req !== REQ_CODE.UserDenied) {
        clearInputs();
        setProgress(0);
      }
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setTmpInput(undefined);
      setLoading(false);
    }
  };

  const lpBalanceText = useMemo(() => {
    const uLP = unitConverter(showLpBalance, 8);
    if (uLP === '0') return '0.00';
    return uLP;
  }, [showLpBalance]);

  return (
    <Row gutter={[0, 16]} className="remove-modal-box">
      <Col span={24} className="remove-modal-box-input" onClick={() => inputRef.current?.focus()}>
        <Row justify="end" gutter={[0, 12]}>
          <Col span={24}>
            <CommonInput
              className="remove-input"
              onChange={inputChange}
              value={tmpInput?.lp || inputs?.lp}
              placeholder="0.00"
              suffix={
                <Row gutter={[6, 0]}>
                  <Col>
                    <CurrencyLogos size={24} tokens={[{ currency: leftToken }, { currency: rightToken }]} />
                  </Col>
                  <Col>
                    <Pairs
                      lineHeight={24}
                      size={20}
                      weight="medium"
                      tokenA={leftToken?.symbol}
                      tokenB={rightToken?.symbol}
                    />
                  </Col>
                </Row>
              }
              ref={inputRef}
            />
          </Col>
          <Col>
            <Font lineHeight={14} size={12} color="two">
              {`${t('lp')}：${lpBalanceText}`}
            </Font>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        {isMobile ? (
          <CommonBlockProgress
            value={progress}
            onChange={(v) => {
              setProgress(showLpBalance.lte(0) ? 0 : v);
              onChange('side', v);
            }}
          />
        ) : (
          <CommonSlider value={Number(inputs?.['side'])} onChange={(v) => onChange('side', v)} />
        )}
      </Col>
      <Col span={24}>
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Row gutter={[4, 0]} align="middle">
              <Col>
                <Font lineHeight={20} color="two">
                  {t('pooled')}
                </Font>
              </Col>
              <Col>
                <CommonTooltip onClick={() => isMobile && setPooledTokensVisible(true)} title={t('tokensTips')} />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={[4, 0]} align="middle">
              <Col>
                <CurrencyLogo src={getELFChainTokenURL(tokenA?.symbol)} symbol={tokenA?.symbol} />
              </Col>
              <Col flex={1}>
                <Pair lineHeight={20} symbol={tokenA?.symbol} />
              </Col>
              <Col>
                <Font lineHeight={20} weight="medium">
                  {unitConverter(
                    tmpInput?.[getCurrencyAddress(leftToken)] || inputs?.[getCurrencyAddress(leftToken)],
                    leftToken?.decimals,
                  )}
                </Font>
              </Col>
              <Col>
                <Pair lineHeight={20} symbol={tokenA?.symbol} color="two" />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={[4, 0]} align="middle">
              <Col>
                <CurrencyLogo src={getELFChainTokenURL(tokenB?.symbol)} symbol={tokenB?.symbol} />
              </Col>
              <Col flex={1}>
                <Pair lineHeight={20} symbol={tokenB?.symbol} />
              </Col>
              <Col>
                <Font lineHeight={20} weight="medium">
                  {unitConverter(
                    tmpInput?.[getCurrencyAddress(rightToken)] || inputs?.[getCurrencyAddress(rightToken)],
                    rightToken?.decimals,
                  )}
                </Font>
              </Col>
              <Col>
                <Pair lineHeight={20} symbol={tokenB?.symbol} color="two" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <PriceAdnLiquidityPool leftToken={leftToken} rightToken={rightToken} reserves={reserves} inputs={inputs} />
      </Col>
      <Col span={24}>
        <CommonButton
          type="primary"
          size="large"
          loading={loading}
          disabled={!!buttonDisabled}
          onClick={() => setRemoveConfirmVisible(true)}
          className="comfirm-btn">
          {t(`${buttonTitle}`)}
        </CommonButton>
      </Col>
      <PooledTokensModal visible={pooledTokensVisible} onClose={() => setPooledTokensVisible(false)} />
      <RemoveConfirmModal
        visible={removeConfirmVisible}
        onClose={() => setRemoveConfirmVisible(false)}
        tokenA={tokenA}
        tokenB={tokenB}
        tokenAValue={tmpInput?.[getCurrencyAddress(leftToken)] || inputs?.[getCurrencyAddress(leftToken)] || '0'}
        tokenBValue={tmpInput?.[getCurrencyAddress(rightToken)] || inputs?.[getCurrencyAddress(rightToken)] || '0'}
        onConfirm={() => {
          setRemoveConfirmVisible(false);
          removeCb();
        }}
      />
    </Row>
  );
}
