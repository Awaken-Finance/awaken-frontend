import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, message } from 'antd';
import Header from 'components/Header';
import ScrollToTop from 'components/ScrollToTop';
import { routes } from 'routes';
import Modals from './Modals';
import './utils/initialize';
import './utils/vconsole';
import { LoadPageLoading } from 'components/Loading';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

const { Content } = Layout;

export default function App() {
  const { loginError } = useConnectWallet();
  useEffect(() => {
    if (!loginError) {
      return;
    }
    message.error(loginError.nativeError.message ?? loginError.message);
  }, [loginError]);

  return (
    <>
      <Router>
        <Modals />
        <Layout className="awaken-layout">
          <Header />
          <Content className="awaken-content" id="site-content">
            <ScrollToTop />
            <Suspense fallback={<LoadPageLoading type="page" />}>
              <Switch>
                {routes.map((route) => {
                  const Comp: any = route.authComp || Route;
                  return (
                    <Comp
                      key={typeof route.path === 'string' ? route.path : route.path.join('_')}
                      path={route.path}
                      exact={!!route.exact}
                      component={route.component}
                      strict={!!route.strict}
                    />
                  );
                })}
              </Switch>
            </Suspense>
          </Content>
        </Layout>
      </Router>
    </>
  );
}
