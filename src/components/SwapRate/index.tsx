import { Col, Row } from 'antd';
import { IconSelected } from 'assets/icons';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Pairs } from 'types/swap';
import { ChainConstants } from 'constants/ChainConstants';
import Font from 'components/Font';
import './styles.less';
import { useMobile } from 'utils/isMobile';
function RateRow({
  title,
  isAdded = true,
  onChange,
  value,
  disabled = false,
}: {
  value?: string;
  address: string;
  title: string;
  isAdded?: boolean;
  onChange?: (k: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const onSelect = (val: string) => {
    if (disabled) {
      return;
    }

    onChange && onChange(val);
  };

  const selected = !disabled && title === value;

  return (
    <Col flex="1 1 0">
      <Row
        className={clsx(
          'rate-row',
          {
            'rate-active': selected,
          },
          {
            'rate-disabled': disabled,
          },
        )}
        onClick={() => onSelect(title)}>
        <Col span={24} className="text-align-center">
          <Font lineHeight={18} size={12} color={disabled ? 'three' : 'one'}>
            {`${title}%`}
          </Font>
        </Col>
        <Col span={24} className="text-align-center">
          {isAdded ? (
            <Font
              lineHeight={12}
              size={12}
              align="center"
              color={disabled ? 'three' : 'primary'}
              className="rate-row-created">
              {t('created')}
            </Font>
          ) : (
            <Font lineHeight={12} size={12} color={disabled ? 'three' : 'two'} className="rate-row-to-create">
              {t('toCreate')}
            </Font>
          )}
        </Col>

        {selected && <IconSelected className="selected-icon" />}
      </Row>
    </Col>
  );
}
export default function SwapRate({
  pairs,
  value,
  onChange,
  disabled,
}: {
  pairs?: Pairs;
  value?: string;
  onChange?: (k: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const isMobile = useMobile();
  return (
    <Row gutter={[0, 8]} className={isMobile ? 'swap-rate-mobile' : 'swap-rate'}>
      <Col span={24}>
        <Font lineHeight={20}>{t('feeTier')}</Font>
      </Col>
      <Col span={24}>
        <Row gutter={[10, 0]} wrap={false}>
          {Object.entries(ChainConstants.constants.FACTORY)
            .sort((a, b) => {
              return Number(a[0]) - Number(b[0]);
            })
            .map(([k, address]) => {
              return (
                <RateRow
                  value={value}
                  isAdded={!!pairs?.[k]}
                  title={k}
                  key={k}
                  address={address}
                  onChange={onChange}
                  disabled={disabled}
                />
              );
            })}
        </Row>
      </Col>
    </Row>
  );
}
