import clsx from 'clsx';
import { ReactComponent as LogoLoading } from './Logo-loading.svg';
import './styles.less';
type LoadingSizeType = 'large' | 'small' | 'middle';
enum LoadingSizeEnum {
  large = '100px',
  middle = '48px',
  small = '24px',
}
export function LoadPageLoading({
  className,
  type,
  size = 'large',
}: {
  className?: string;
  type?: 'page' | 'default' | 'userCenter';
  size?: LoadingSizeType;
}) {
  return (
    <div
      className={clsx(
        'awaken-loading',
        type === 'page' && 'awaken-page-loading',
        type === 'userCenter' && 'awaken-user-center-loading',
        className,
      )}>
      <LogoLoading style={{ height: LoadingSizeEnum[size], width: LoadingSizeEnum[size] }} />
    </div>
  );
}
