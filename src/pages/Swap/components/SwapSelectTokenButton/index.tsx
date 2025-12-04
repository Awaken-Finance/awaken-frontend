import { Row, Col } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Currency } from '@awaken/sdk-core';
import { CurrencyLogo } from 'components/CurrencyLogo';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { Pair } from 'components/Pair';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import Font from 'components/Font';
import { IconArrowDown } from 'assets/icons';
import './styles.less';

interface SelectTokenButtonProps extends CommonButtonProps {
  token?: Currency;
  setToken?: (token?: Currency) => void;
}

export default function SwapSelectTokenButton({ token, setToken, className, ...props }: SelectTokenButtonProps) {
  const { t } = useTranslation();

  const dispatch = useModalDispatch();

  const onClick = () => dispatch(basicModalView.setSelectTokenModal.actions(true, setToken, token));

  const renderContent = () => {
    if (!token) {
      return (
        <div className="select-token-btn-label-wrap">
          <Font size={16} lineHeight={24} weight="bold" align="left">
            {t('selectAToken')}
          </Font>
        </div>
      );
    }

    return (
      <Row gutter={[8, 0]} align="middle">
        <Col>
          <CurrencyLogo size={24} currency={token} />
        </Col>
        <Col className="flex-center-middle">
          <Pair className="select-token-pair" symbol={token?.symbol} size={16} lineHeight={24} weight="medium" />
        </Col>
      </Row>
    );
  };

  return (
    <CommonButton
      type={token ? 'ghost' : 'primary'}
      className={clsx('select-token-btn', className)}
      onClick={onClick}
      {...props}>
      <Row justify="space-between" align="middle">
        <Col className="select-token-middle">{renderContent()}</Col>
        <Col className="select-token-icon-col">
          <IconArrowDown className="select-token-icon" />
        </Col>
      </Row>
    </CommonButton>
  );
}
