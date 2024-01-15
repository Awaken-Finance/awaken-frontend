import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { IconSettingFee } from 'assets/icons';
import Font from 'components/Font';
import SettingFee from 'Buttons/SettingFeeBtn';
import BigNumber from 'bignumber.js';
import { useMobile } from 'utils/isMobile';

export default function Slippage({ value }: { value: BigNumber.Value }) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <Row justify="space-between">
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
          {t('slippageTolerance')}
        </Font>
      </Col>
      <Col>
        <Row gutter={[4, 0]} align="middle">
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium" subfix="%">
              {new BigNumber(value).dp(2).toString()}
            </Font>
          </Col>
          <Col>
            <SettingFee className="slippage-set-fee">
              <IconSettingFee />
            </SettingFee>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
