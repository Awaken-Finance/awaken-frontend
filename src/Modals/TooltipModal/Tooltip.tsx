import { Row, Col } from 'antd';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import './index.less';
import { ReactNode, useMemo } from 'react';

export default function Tooltip({ buttonTitle, content }: { buttonTitle?: ReactNode; content?: ReactNode }) {
  const [, { dispatch }] = useModal();
  const isStr = useMemo(() => typeof content === 'string', [content]);
  return (
    <Row gutter={[0, 24]}>
      <Col span={24}>
        {isStr ? (
          <Font lineHeight={20} size={14} className="content">
            {content}
          </Font>
        ) : (
          content
        )}
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
