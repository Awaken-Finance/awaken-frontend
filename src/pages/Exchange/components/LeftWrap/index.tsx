import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TradePairList from 'components/TradePairList';
import Font from 'components/Font';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import './index.less';

function LeftWarp() {
  const { t } = useTranslation();

  const [{ socket }] = useSwapContext();

  return (
    <div className="left-warp">
      <TradePairList
        title={
          <Font size={16} weight="bold" lineHeight={24}>
            {t('pools')}
          </Font>
        }
        socket={socket}
      />
    </div>
  );
}

export default memo(LeftWarp);
