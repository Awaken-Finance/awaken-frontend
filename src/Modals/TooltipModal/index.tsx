import CommonModal from 'components/CommonModal';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';

import TooltipMemo from './Tooltip';

import './index.less';

export default function TooltipModal() {
  const [{ ToolTip }, { dispatch }] = useModal();
  const { headerDesc, title, buttonTitle } = ToolTip || {};
  return (
    <CommonModal
      width="320px"
      showType="modal"
      centered={true}
      closable
      showBackIcon={false}
      visible={!!ToolTip}
      title={headerDesc}
      onCancel={() => dispatch(basicModalView.setTooltipModal.actions())}
      className="tooltip-modal">
      <TooltipMemo content={title} buttonTitle={buttonTitle} />
    </CommonModal>
  );
}
