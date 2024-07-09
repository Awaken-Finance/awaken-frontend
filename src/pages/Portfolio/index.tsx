import { useCallback, useEffect, useMemo, useState } from 'react';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import { PortfolioOverview } from './components/PortfolioOverview';
import CommonLink from 'components/CommonLink';
import { useHistory } from 'react-router-dom';
import { PortfolioPositions } from './components/PortfolioPositions';
import './styles.less';
import { WebLoginState, useWebLogin } from 'aelf-web-login';
import { useMobile } from 'utils/isMobile';
import { IconArrowRight3, IconClose2 } from 'assets/icons';

export const Portfolio = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const history = useHistory();
  const onTransactionsClick = useCallback(() => {
    history.push('/transactions');
  }, [history]);
  const { loginState } = useWebLogin();
  const isLogin = useMemo(() => loginState === WebLoginState.logined, [loginState]);

  const [isTipsShow, setIsTipsShow] = useState(false);
  useEffect(() => {
    const isHide = localStorage.getItem('PORTFOLIO_TIPS_HIDE');

    if (isHide) setIsTipsShow(false);
    else setIsTipsShow(true);
  }, []);
  const closeTips = useCallback(() => {
    setIsTipsShow(false);
    localStorage.setItem('PORTFOLIO_TIPS_HIDE', 'true');
  }, []);

  return (
    <div className="portfolio-page">
      {isTipsShow && (
        <div className="portfolio-page-tips">
          <IconClose2 onClick={closeTips} className="portfolio-page-tips-close" />

          <Font size={isMobile ? 14 : 16} lineHeight={24} weight="medium">
            {t('portfolioTipsTitle')}
          </Font>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 16 : 20} color="two">
            {t('portfolioTipsDescription')}
          </Font>

          <a
            href="https://awakenswap.gitbook.io/help-en/liquidity-provider-faq/why-earn-profits-by-providing-liquidity"
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-page-tips-more">
            <Font size={14} lineHeight={20} color="primary" weight="medium">
              {t('Learn more')}
            </Font>
            <IconArrowRight3 />
          </a>
        </div>
      )}

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
