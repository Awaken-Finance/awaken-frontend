import { useMobile } from 'utils/isMobile';
import MobileHeader from './component/MobileHeader';
import PcHeader from './component/PcHeader';
export default function Header() {
  const isMobile = useMobile();

  return isMobile ? <MobileHeader /> : <PcHeader />;
}
