import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';
import clsx from 'clsx';
import './styles.less';

export enum ExpiryEnum {
  day = 1,
  threeDay = 3,
  week = 7,
  month = 30,
}

type TExpiryItem = {
  label: string;
  value: ExpiryEnum;
};
const EXPIRY_LIST: TExpiryItem[] = [
  {
    label: '1 day',
    value: ExpiryEnum.day,
  },
  {
    label: '3 days',
    value: ExpiryEnum.threeDay,
  },
  {
    label: '7 days',
    value: ExpiryEnum.week,
  },
  {
    label: '30 days',
    value: ExpiryEnum.month,
  },
];

export type TLimitMaxValueProps = {
  value: ExpiryEnum;
  onChange?: (value: ExpiryEnum) => void;
};
export const LimitExpiry = ({ value, onChange }: TLimitMaxValueProps) => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <Row justify="space-between" className="limit-expiry">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
            {t('Expiry')}
          </Font>
        </Col>
        <Col>
          <CommonTooltip
            placement="topLeft"
            title={t('expiryDescription')}
            headerDesc={t('Expiry')}
            buttonTitle={t('ok')}
          />
        </Col>
      </Row>
      <div className="limit-expiry-btn-area">
        {EXPIRY_LIST.map((item) => (
          <div
            className={clsx('limit-expiry-btn', value === item.value && 'limit-expiry-btn-active')}
            onClick={() => onChange?.(item.value)}>
            <Font size={12} lineHeight={20} color="two">
              {item.label}
            </Font>
          </div>
        ))}
      </div>
    </Row>
  );
};
