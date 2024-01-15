import { useMemo } from 'react';
import { Route, NavLink, useLocation, useHistory } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { UserCenterProvider } from './hooks/useUserCenter';
import { routeMap } from './routes';
import { useMobile } from 'utils/isMobile';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Updater from './hooks/Updater';

import './UserCenter.less';
export function UserCenter({ url }: { url: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();
  const defaultKeys = useMemo(() => {
    return pathname.replaceAll(url, '') || '/';
  }, [pathname, url]);
  const isMobile = useMobile();

  return useMemo(
    () => (
      <Layout className={clsx('user-center-layout', isMobile && 'user-center-mobile-layout')}>
        {isMobile ? (
          <Layout.Header className="site-layout-nav-mobile">
            <Menu mode="horizontal" selectedKeys={[defaultKeys]} className="menu-headers" overflowedIndicator={<></>}>
              {routeMap.map((route) => (
                <Menu.Item key={route.path} onClick={() => history.push(`/user-center${route.path}`)}>
                  {t(route.menuItem || route.path.slice(1))}
                </Menu.Item>
              ))}
            </Menu>
          </Layout.Header>
        ) : (
          <Layout.Sider trigger={null} theme={'light'} className="site-layout-nav">
            <Menu mode="inline" selectedKeys={[defaultKeys]} inlineIndent={20}>
              {routeMap.map((route) => (
                <Menu.Item key={route.path}>
                  <NavLink to={url + (route.path.slice(1) ? route.path : '')} style={{ textTransform: 'capitalize' }}>
                    {t(route.menuItem || route.path.slice(1))}
                  </NavLink>
                </Menu.Item>
              ))}
            </Menu>
          </Layout.Sider>
        )}
        <Layout>
          <Layout.Content className={clsx('site-layout-content', isMobile && 'site-layout-content-mobile')}>
            <UserCenterProvider>
              <Updater />
              {routeMap.map((route) => {
                return (
                  <Route key={route.path} path={url + route.path} exact={!!route.exact} component={route.component} />
                );
              })}
            </UserCenterProvider>
          </Layout.Content>
        </Layout>
      </Layout>
    ),
    [isMobile, defaultKeys, t, history, url],
  );
}
