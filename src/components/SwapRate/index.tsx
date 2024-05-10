import { Col, Row } from 'antd';
import { IconSelected } from 'assets/icons';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Pairs } from 'types/swap';
import { ChainConstants } from 'constants/ChainConstants';
import Font from 'components/Font';
import './styles.less';
import { useMobile } from 'utils/isMobile';
import { useMemo } from 'react';
import CommonTooltip from 'components/CommonTooltip';
import { SupportedSwapRate, SupportedSwapRateTipMap } from 'constants/swap';
function RateRow({
  title,
  isAdded = true,
  onChange,
  value,
  disabled = false,
  span,
  tip,
}: {
  value?: string;
  address: string;
  title: string;
  isAdded?: boolean;
  onChange?: (k: string) => void;
  disabled?: boolean;
  span?: number;
  tip?: string;
}) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const onSelect = (val: string) => {
    if (disabled) {
      return;
    }

    onChange && onChange(val);
  };

  const selected = !disabled && title === value;

  return (
    <Col flex="1 1 0" span={span}>
      <div
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
        <div className="rate-row-content">
          <div>
            <Font lineHeight={22} size={14} color={disabled ? 'three' : 'one'}>
              {`${title}%`}
            </Font>
          </div>
          <div className="rate-row-tip-wrap">
            <Font lineHeight={isMobile ? 12 : 16} size={isMobile ? 10 : 12} color="two">
              {tip}
            </Font>
          </div>
        </div>
        <div>
          {isAdded ? (
            <Font
              lineHeight={isMobile ? 12 : 16}
              size={isMobile ? 10 : 12}
              align="center"
              color={disabled ? 'three' : 'primary'}
              className="rate-row-created">
              {t('created')}
            </Font>
          ) : (
            <Font
              lineHeight={isMobile ? 12 : 16}
              size={isMobile ? 10 : 12}
              color={disabled ? 'three' : 'two'}
              className="rate-row-to-create">
              {t('toCreate')}
            </Font>
          )}
        </div>

        {selected && <IconSelected className="selected-icon" />}
      </div>
    </Col>
  );
}

const COL_COUNTS = 3;
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

  const rowList = useMemo(() => {
    const list = Object.entries(ChainConstants.constants.FACTORY).sort((a, b) => {
      return Number(a[0]) - Number(b[0]);
    });

    if (!isMobile) return [list];
    const _rowList: Array<typeof list> = [];
    list.forEach((item, idx) => {
      const rowIdx = Math.floor(idx / COL_COUNTS);
      if (_rowList[rowIdx]) _rowList[rowIdx].push(item);
      else _rowList[rowIdx] = [item];
    });
    return _rowList;
  }, [isMobile]);

  return (
    <Row gutter={[0, 8]} className={isMobile ? 'swap-rate-mobile' : 'swap-rate'}>
      <Col span={24}>
        <Row gutter={[4, 0]} align="middle">
          <Col>
            <Font lineHeight={20}>{t('feeTier')}</Font>
          </Col>
          <Col>
            <CommonTooltip placement="top" title={t('feeTierTip')} headerDesc={t('feeTier')} buttonTitle={t('ok')} />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        {rowList.map((row, idx) => (
          <Row className={idx !== 0 ? 'swap-rate-row-gap' : undefined} gutter={[8, 0]} wrap={false}>
            {row.map(([k, address]) => {
              return (
                <RateRow
                  value={value}
                  isAdded={!!pairs?.[k]}
                  title={k}
                  key={k}
                  address={address}
                  onChange={onChange}
                  disabled={disabled}
                  span={isMobile ? 8 : undefined}
                  tip={t(SupportedSwapRateTipMap[k as SupportedSwapRate])}
                />
              );
            })}
          </Row>
        ))}
      </Col>
    </Row>
  );
}
