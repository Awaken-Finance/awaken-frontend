import { useCallback, useMemo } from 'react';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import { PortfolioOverview } from './components/PortfolioOverview';
import CommonLink from 'components/CommonLink';
import { useHistory } from 'react-router-dom';
import { PortfolioPositions } from './components/PortfolioPositions';
import './styles.less';
import { WebLoginState, useWebLogin } from 'aelf-web-login';
import { useMobile } from 'utils/isMobile';

export const Portfolio = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const history = useHistory();
  const onTransactionsClick = useCallback(() => {
    history.push('/transactions');
  }, [history]);
  const { loginState } = useWebLogin();
  const isLogin = useMemo(() => loginState === WebLoginState.logined, [loginState]);

  return (
    <div className="portfolio-page">
      <div className="portfolio-page-header">
        <Font weight="bold" size={isMobile ? 24 : 32} lineHeight={isMobile ? 32 : 40}>
          {t('My Portfolio')}
        </Font>
        <CommonLink size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24} onClick={onTransactionsClick}>
          {t('recentTransaction')}
        </CommonLink>
      </div>

      <PortfolioOverview />

      {isLogin && <PortfolioPositions />}
    </div>
  );
};

export default Portfolio;
