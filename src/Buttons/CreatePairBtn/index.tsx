import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import Font from 'components/Font';
import { FontSize } from 'utils/getFontStyle';
import useLoginCheck from 'hooks/useLoginCheck';
import { useHistory } from 'react-router-dom';

import './index.less';
interface CreatePairBtnProps extends CommonButtonProps {
  useBtn?: boolean;
  fontSize?: FontSize;
}

export default function ({ useBtn = false, children, ...props }: CreatePairBtnProps) {
  const { t } = useTranslation();

  const isMobile = useMobile();
  const history = useHistory();

  const callback = () => history.push('/create-pair');

  const onClick = useLoginCheck(
    {
      checkAccountSync: true,
      redirect: '/create-pair',
    },
    callback,
  );

  const renderContent = useMemo(() => {
    if (children) {
      return children;
    }

    if (useBtn) {
      return (
        <CommonButton className="create-pair-btn" type="primary" {...props}>
          <Font size={isMobile ? 14 : 16} weight={isMobile ? 'regular' : 'medium'}>
            {t(`addPairs${isMobile ? '_mobile' : ''}`)}
          </Font>
        </CommonButton>
      );
    }

    return <Font weight="medium">{t(`addPairs${isMobile ? '_mobile' : ''}`)}</Font>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, useBtn, t, isMobile, { ...props }]);

  return <div onClick={onClick}>{renderContent}</div>;
}
