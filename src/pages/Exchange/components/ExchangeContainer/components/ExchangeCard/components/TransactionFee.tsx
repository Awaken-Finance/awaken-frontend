import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';
import { useTransactionFee } from 'contexts/useStore/hooks';
import { LineHeight } from 'utils/getFontStyle';
import { useMemo } from 'react';

export type TTransactionFeeProps = {
  lineHeight?: LineHeight;
};
export default function TransactionFee({ lineHeight: lineHeightProp }: TTransactionFeeProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const data = useTransactionFee();

  const lineHeight: LineHeight = useMemo(() => {
    if (lineHeightProp) return lineHeightProp;
    return isMobile ? 18 : 20;
  }, [isMobile, lineHeightProp]);

  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={lineHeight} color="two">
            {t('transactionFee')}
          </Font>
        </Col>
        <Col>
          <CommonTooltip
            placement="topLeft"
            title={t('transactionFeeDescription')}
            headerDesc={t('transactionFee')}
            buttonTitle={t('ok')}
          />
        </Col>
      </Row>
      <Col>
        <Row gutter={[2, 0]}>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={lineHeight} weight="medium">
              {divDecimals(new BigNumber(data), 8).toFixed()}
            </Font>
          </Col>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={lineHeight} color="two">
              ELF
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
