import { IconDiscord, IconLogo, IconTelegram, IconX } from 'assets/icons';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';

type TMenuItem = {
  icon?: typeof IconX;
  title: string;
  link: string;
};

type TMenuGroup = {
  title: string;
  list: TMenuItem[];
};

const MEDIA_LIST: Required<TMenuItem>[] = [
  {
    icon: IconX,
    title: 'Twitter',
    link: 'https://twitter.com/AwakenSwap',
  },
  {
    icon: IconDiscord,
    title: 'Discord',
    link: 'https://discord.gg/uVbGVVbRhA',
  },
  {
    icon: IconTelegram,
    title: 'Telegram',
    link: 'https://t.me/AwakenSwap',
  },
];

const MENU_LIST: TMenuGroup[] = [
  {
    title: 'Document',
    list: [
      {
        title: 'Audit Report',
        link: 'https://awakenswap.gitbook.io/help-en/learn-about-awakenswap/audit-report',
      },
      {
        title: 'Terms of Service',
        link: 'https://awakenswap.gitbook.io/help-en/terms-and-privacy/awakenswap-terms-of-service',
      },
      {
        title: 'Privacy Policy',
        link: 'https://awakenswap.gitbook.io/help-en/terms-and-privacy/awakenswap-privacy-policy',
      },
    ],
  },
  {
    title: 'Help',
    list: [
      {
        title: 'About',
        link: 'https://awakenswap.gitbook.io/help-en',
      },
      {
        title: 'User Guide',
        link: 'https://awakenswap.gitbook.io/help-en/user-guide/how-to-trade-on-awakenswap',
      },
      {
        title: 'FAQ',
        link: 'https://awakenswap.gitbook.io/help-en/general-faq/what-is-awakenswap',
      },
    ],
  },
];

export const OverviewFooter = () => {
  const { t } = useTranslation();

  return (
    <div className="overview-footer">
      <div className="overview-footer-content">
        <div className="overview-footer-info">
          <IconLogo className="overview-footer-logo" />
          <Font size={14} lineHeight={22} color="two">
            {t('awakenDescription')}
          </Font>
        </div>
        <div className="overview-footer-menu-wrap">
          {MENU_LIST.map((menuGroup) => (
            <div key={menuGroup.title} className="overview-footer-menu-group">
              <Font size={16} lineHeight={24} color="two">
                {t(menuGroup.title)}
              </Font>
              <div className="overview-footer-menu-list">
                {menuGroup.list.map((item) => (
                  <div key={item.title}>
                    <a className="overview-footer-menu-link" target="_blank" href={item.link}>
                      {item.icon && <item.icon className="overview-footer-menu-icon" />}
                      <Font size={14} lineHeight={20} color="one">
                        {t(item.title)}
                      </Font>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-footer-copyright">
        <div className="overview-media-list">
          {MEDIA_LIST.map((item, idx) => (
            <a key={idx} className="overview-media-icon" target="_blank" href={item.link}>
              <item.icon />
            </a>
          ))}
        </div>

        <Font lineHeight={22} size={14} color="three">
          AwakenSwap@2024
        </Font>
      </div>
    </div>
  );
};
