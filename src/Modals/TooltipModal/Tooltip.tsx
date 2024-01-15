import { Row, Col } from 'antd';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import './index.less';
import { ReactNode } from 'react';

export default function Tooltip({ buttonTitle, content }: { buttonTitle?: ReactNode; content?: ReactNode }) {
  const [, { dispatch }] = useModal();
  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        <Font lineHeight={20} size={14} className="content">
          {content}
        </Font>
      </Col>
      <CommonButton
        className="tooltip-modal-btn"
        type="primary"
        onClick={() => dispatch(basicModalView.setTooltipModal.actions())}>
        <Font size={16}>{buttonTitle}</Font>
      </CommonButton>
    </Row>
  );
}
