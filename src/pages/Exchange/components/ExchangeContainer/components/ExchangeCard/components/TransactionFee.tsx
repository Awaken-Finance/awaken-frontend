import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRequest, useUpdateEffect } from 'ahooks';
import { getTransactionFee } from 'pages/Exchange/apis/getTransactionFee';
import Font from 'components/Font';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';

export default function TransactionFee({ onChange = () => null }: { onChange: (val: BigNumber.Value) => void }) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const { data = 0 } = useRequest(getTransactionFee);

  useUpdateEffect(() => {
    onChange(new BigNumber(data));
  }, [data]);

  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
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
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
              {divDecimals(new BigNumber(data), 8).toFixed()}
            </Font>
          </Col>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
              ELF
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
