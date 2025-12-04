import { memo } from 'react';
import { Drawer, DrawerProps } from 'antd';

import { useTranslation } from 'react-i18next';
import TradePairList from 'components/TradePairList';
import Font from 'components/Font';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import { IconClose } from 'assets/icons';
import './DrawerTradePair.less';
import CommonButton from 'components/CommonButton';

function DrawerTradePair({
  onClose,
  visible,
  ...props
}: DrawerProps & {
  onClose: () => void;
  visible: boolean;
}) {
  const { t } = useTranslation();

  const [{ socket }] = useSwapContext();

  return (
    <Drawer
      title=""
      height="calc(100vh - 108px)"
      placement="bottom"
      closable={false}
      onClose={onClose}
      visible={visible}
      {...props}
      className="mobile-trade-pair-sidler">
      <div className="trade-pair-box">
        <CommonButton className="close-icon-btn" type="text" icon={<IconClose />} onClick={onClose} />
        <TradePairList
          title={
            <Font size={16} weight="bold" lineHeight={24}>
              {t('pools')}
            </Font>
          }
          height="calc(100vh - 280px)"
          socket={socket}
          onSelect={onClose}
        />
      </div>
    </Drawer>
  );
}

export default memo(DrawerTradePair);
