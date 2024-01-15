import { Spin } from 'antd';
import { SpinProps } from 'antd/lib/spin';
import Lottie from 'lottie-react';
import { awakenLoading } from 'assets/animation';
import { LoadingBg } from 'assets/icons';

import './index.less';

export default function CommonLoading(props: SpinProps) {
  return (
    <Spin
      wrapperClassName="common-loading"
      indicator={
        <span className="loading-box">
          <Lottie className="loading-box-animation" animationData={awakenLoading} loop />
          <LoadingBg className="loading-box-bg" />
        </span>
      }
      {...props}>
      {props.children}
    </Spin>
  );
}
