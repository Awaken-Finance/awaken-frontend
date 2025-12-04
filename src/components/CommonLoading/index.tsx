import { Spin } from 'antd';
import { SpinProps } from 'antd/lib/spin';
import { COMMON_LOADING_CONFIG } from 'components/CommonLoading/loading';
import './index.less';

export default function CommonLoading({ showBg, ...props }: SpinProps & { showBg?: boolean }) {
  return (
    <Spin {...COMMON_LOADING_CONFIG(showBg)} {...props}>
      {props.children}
    </Spin>
  );
}
