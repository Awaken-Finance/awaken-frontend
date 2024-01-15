import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'antd';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useUserSettings } from 'contexts/useUserSettings';
import { useTranslation } from 'react-i18next';
import { timesDecimals } from 'utils/calculate';
import { useMobile } from 'utils/isMobile';
import { priceImpactList } from './config';
import Font from 'components/Font';
import CommonInput from 'components/CommonInput';
import CommonSwitch from 'components/CommonSwitch';
import BigNumber from 'bignumber.js';

export default function TransactionSettings() {
  const { t } = useTranslation();
  const [
    { userSlippageTolerance, userExpiration, isExpert },
    { setUserSlippageTolerance, setUserExpiration, setIsExpert },
  ] = useUserSettings();
  const isMobile = useMobile();
  const modalDispatch = useModalDispatch();

  const [inputVal, setInputVal] = useState('0');

  const inputChange = useCallback(
    (value: string) => {
      if (!value) {
        setUserSlippageTolerance('');
        return;
      }
      if (/^(0|[1-9][0-9]{0,1})(\.[0-9]{0,2})?$/.test(value)) {
        if (/\.$/.test(value)) {
          setInputVal(value);
          return;
        }

        const realVal = new BigNumber(value).div(100).toString();
        setUserSlippageTolerance(realVal);
      }
    },
    [setUserSlippageTolerance],
  );

  const minsChange = useCallback(
    (value: string) => {
      const val = value.trim();
      if (val && !/^(0|[1-9][0-9]*)$/.test(val)) {
        return;
      }

      setUserExpiration(val);
    },
    [setUserExpiration],
  );

  const switchChange = useCallback(
    (val?: boolean) => {
      if (val) {
        modalDispatch(basicModalView.setExpertModeModal.actions(true));
        return;
      }
      setIsExpert(val);
    },
    [modalDispatch, setIsExpert],
  );

  useEffect(() => {
    if (!userSlippageTolerance) {
      setInputVal('');
      return;
    }

    const bigUserSlippageTolerance = new BigNumber(userSlippageTolerance);

    if (bigUserSlippageTolerance.isEqualTo(0)) {
      setInputVal('0');
      return;
    }
    setInputVal(bigUserSlippageTolerance.times(100).toString());
  }, [userSlippageTolerance]);

  return (
    <Row gutter={[0, 8]}>
      <Col span={24}>
        <Row gutter={[4, 0]} align="middle">
          <Col>
            <Font lineHeight={20} color="two">
              {t('slippageTolerance')}
            </Font>
          </Col>
          <Col>
            <CommonTooltip
              placement="topRight"
              title={t('tradingSettingTip1')}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('slippageTolerance')}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[8, 0]} wrap={false}>
          {priceImpactList.map(({ value }) => (
            <Col key={value}>
              <div
                className={clsx('fee-item', {
                  'fee-item-ative': userSlippageTolerance === value,
                  'fee-item-mobile': isMobile,
                })}
                onClick={() => setUserSlippageTolerance(value)}>
                <Font
                  lineHeight={20}
                  weight="medium"
                  color={userSlippageTolerance === value ? 'primary' : 'one'}>{`${timesDecimals(
                  value,
                  2,
                ).toFixed()}%`}</Font>
              </div>
            </Col>
          ))}
          <Col flex={1}>
            <CommonInput
              suffix={<Font>%</Font>}
              className="fee-input"
              onChange={(event) => inputChange(event?.target?.value)}
              value={inputVal}
              textAlign="right"
            />
          </Col>
        </Row>
      </Col>
      <Col className="box-margin" span={24}>
        <Row gutter={[4, 0]} align="middle">
          <Col>
            <Font lineHeight={20} color="two">
              {t('expirationTimeToTrade')}
            </Font>
          </Col>
          <Col>
            <CommonTooltip
              placement="topRight"
              title={t('tradingSettingTip2')}
              getPopupContainer={(v) => v}
              buttonTitle={t('ok')}
              headerDesc={t('expirationTimeToTrade')}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[8, 0]} align="middle">
          <Col>
            <CommonInput
              className="mins-input"
              placeholder="20"
              value={userExpiration}
              onChange={(event) => minsChange(event?.target?.value)}
              // type="number"
            />
          </Col>
          <Col>
            <Font lineHeight={20} color="two">
              {t('min(s)')}
            </Font>
          </Col>
        </Row>
      </Col>
      <Col className="box-margin" span={24}>
        <Row justify="end" align="middle" gutter={[4, 0]}>
          <Col>
            <Font lineHeight={20} color="two">
              {t('expertMode')}
            </Font>
          </Col>
          <Col>
            <CommonTooltip
              placement="topRight"
              title={t('expertModeTip')}
              buttonTitle={t('ok')}
              headerDesc={t('expertMode')}
            />
          </Col>
          <Col flex={1} className="switch-icon">
            <CommonSwitch checked={isExpert} onChange={switchChange} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
