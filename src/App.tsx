import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, message } from 'antd';
import { PortkeyLoading } from '@portkey/did-ui-react';
import Header from 'components/Header';
import ScrollToTop from 'components/ScrollToTop';
import { routes } from 'routes';
import Modals from './Modals';
import './utils/initialize';
import './utils/vconsole';
import { LoadPageLoading } from 'components/Loading';
import { WebLoginEvents, usePortkeyLock, usePortkeyPreparing, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import { WebLoginInstance } from 'utils/webLogin';

const { Content } = Layout;

export default function App() {
  const { isPreparing } = usePortkeyPreparing();
  const { isUnlocking } = usePortkeyLock();
  const webLoginContext = useWebLogin();
  WebLoginInstance.get().setWebLoginContext(webLoginContext);

  useWebLoginEvent(WebLoginEvents.ERROR, (error: any) => {
    console.error(error);
    if (error.code) {
      if (error.message) {
        message.error(error.message);
      }
    }
  });

  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, (error: any) => {
    console.error(error);
    if (error.code) {
      if (error.message) {
        message.error(error.message);
      }
    }
  });

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
                      key={route.path}
                      path={route.path}
                      exact={!!route.exact}
                      component={route.component}
                      strict={!!route.strict}
                    />
                  );
                })}
              </Switch>
            </Suspense>
            <PortkeyLoading loading={isPreparing || isUnlocking} />
          </Content>
        </Layout>
      </Router>
    </>
  );
}
