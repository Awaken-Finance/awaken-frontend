import { Col, Row } from 'antd';
import CommonButton from 'components/CommonButton';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import CurrencyRow from './CurrencyRow';
import { Currency } from '@awaken/sdk-core';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import { useRequest } from 'ahooks';
import BigNumber from 'bignumber.js';
import { getTransactionFee } from 'pages/Exchange/apis/getTransactionFee';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { usePair, usePairsAddress } from 'hooks/userPairs';
import { getCurrencyAddress, getLiquidity, parseUserSlippageTolerance } from 'utils/swap';
import { useUserSettings } from 'contexts/useUserSettings';
import { PairsAndLogos } from 'components/PariAndLogo';
import { unitConverter } from 'utils';
import { ChainConstants } from 'constants/ChainConstants';
import { useMemo } from 'react';
import { isNFTSymbol } from 'utils/reg';

export function AddConfirmModal({
  tokenA,
  tokenB,
  tokenAValue,
  tokenBValue,
  visible,
  rate,
  shareOfPool,
  onClose,
  onConfirm,
}: {
  tokenA: Currency | undefined;
  tokenB: Currency | undefined;
  tokenAValue: string | undefined;
  tokenBValue: string | undefined;
  visible: boolean;
  rate: string;
  shareOfPool: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const width = isMobile ? '320px' : '420px';
  const { data: transactionFee = 0 } = useRequest(getTransactionFee);

  const pairAddress = usePairsAddress(rate, tokenA, tokenB);

  const routerAddress = ChainConstants.constants.ROUTER[rate];
  const { reserves, totalSupply } = usePair(pairAddress, routerAddress);

  const lp = useMemo(() => {
    if (isNFTSymbol(tokenA?.symbol)) {
      return getLiquidity(tokenAValue, timesDecimals(reserves?.[getCurrencyAddress(tokenA)], 8), totalSupply).toFixed();
    }

    if (isNFTSymbol(tokenB?.symbol)) {
      return getLiquidity(tokenBValue, timesDecimals(reserves?.[getCurrencyAddress(tokenB)], 8), totalSupply).toFixed();
    }

    return getLiquidity(tokenAValue, reserves?.[getCurrencyAddress(tokenA)], totalSupply).toFixed();
  }, [reserves, tokenA, tokenAValue, tokenB, tokenBValue, totalSupply]);

  const [{ userSlippageTolerance }] = useUserSettings();

  const lpUnit = useMemo(() => {
    const uLP = unitConverter(lp, 8);
    if (uLP === '0') return '0.00';
    return uLP;
  }, [lp]);

  if (!tokenA || !tokenB || !tokenAValue || !tokenBValue) return null;

  return (
    <CommonModal
      className={isMobile ? 'liq-confirm-modal-m' : 'add-liq-confirm-modal'}
      visible={visible}
      width={width}
      showType="modal"
      title={t('Confirm')}
      onClose={onClose}
      onCancel={onClose}
      showBackIcon={false}
      closable={true}
      centered>
      <Row justify="space-between">
        <Col>
          <Row gutter={[8, 0]}>
            <Col>
              <PairsAndLogos
                gutter={[8, 0]}
                logos={{ size: 24, tokens: [{ currency: tokenA }, { currency: tokenB }] }}
                pairs={{
                  tokenA: tokenA?.symbol,
                  tokenB: tokenB?.symbol,
                  lineHeight: 24,
                  size: 16,
                  weight: 'medium',
                }}
              />
            </Col>
            <Col>
              <Font lineHeight={24} size={16} weight="medium">
                {t('lp')}
              </Font>
            </Col>
          </Row>
        </Col>
        <Col>
          <Font lineHeight={24} size={16} weight="medium">
            {lpUnit}
          </Font>
        </Col>
      </Row>
      <Row>
        <Font size={14} color="one" lineHeight={20}>
          {t('YouWillReceiveDesc', { value: parseUserSlippageTolerance(userSlippageTolerance) })}
        </Font>
      </Row>
      <Row>
        <Col className="sub-row-container" flex={1}>
          <Row>
            <Font size={14} color="two">
              {t('Deposited')}
            </Font>
          </Row>
          <CurrencyRow token={tokenA} value={tokenAValue} />
          <CurrencyRow token={tokenB} value={tokenBValue} />
        </Col>
      </Row>
      <Row>
        <Col flex={1} className="sub-row-container">
          <Row gutter={[2, 0]} align="middle">
            <Col flex={1}>
              <Font size={14} color="two">
                {t('shareOfPool')}
              </Font>
            </Col>
            <Col>
              <Font lineHeight={20} weight="medium">
                {shareOfPool}
              </Font>
            </Col>
          </Row>
          <Row gutter={[2, 0]} align="middle">
            <Col flex={1}>
              <Font size={14} color="two">
                {t('EstimatedTransactionFee')}
              </Font>
            </Col>
            <Col>
              <Font lineHeight={20} weight="medium">
                {divDecimals(new BigNumber(transactionFee), 8)}
              </Font>
              <Font lineHeight={20} weight="medium" color="two">
                &nbsp;ELF
              </Font>
            </Col>
          </Row>
        </Col>
      </Row>

      <CommonButton type="primary" size="large" block onClick={onConfirm} className="confirm-btn">
        <Font size={16} color={'one'}>
          {t('ConfirmAdd')}
        </Font>
      </CommonButton>
    </CommonModal>
  );
}
