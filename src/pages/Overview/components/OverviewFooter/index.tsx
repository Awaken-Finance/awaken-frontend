import { IconDiscord, IconTelegram, IconX } from 'assets/icons';
import Font from 'components/Font';

const MEDIA_LIST = [
  {
    icon: IconX,
    link: 'https://twitter.com/AwakenSwap',
  },
  {
    icon: IconTelegram,
    link: 'https://t.me/AwakenSwap',
  },
  {
    icon: IconDiscord,
    link: 'https://discord.gg/uVbGVVbRhA',
  },
];

export const OverviewFooter = () => {
  return (
    <div className="overview-footer">
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
  );
};
