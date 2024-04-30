import { awakenLoading } from 'assets/animation';
import { LoadingBg } from 'assets/icons';
import Lottie from 'lottie-react';
import './index.less';

export const COMMON_LOADING_CONFIG = (showBg = false) => ({
  wrapperClassName: 'common-loading',
  indicator: (
    <span className="loading-box">
      <Lottie className="loading-box-animation" animationData={awakenLoading} loop />
      {showBg && <LoadingBg className="loading-box-bg" />}
    </span>
  ),
});
