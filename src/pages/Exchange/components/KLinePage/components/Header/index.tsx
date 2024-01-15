import { Col, Row } from 'antd';

import CommonCard from 'components/CommonCard';
import Font from 'components/Font';
import FeeRate from 'components/FeeRate';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';

import { PoolItem } from 'types';
import { unifyWTokenSymbol } from 'utils';
import { formatPercentage } from 'utils/price';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft2 } from 'assets/icons';

export default ({ pairInfo, onClose, className }: { pairInfo: PoolItem; onClose: () => void; className: string }) => {
  return (
    <CommonCard title={null} className={className}>
      <Row justify="space-between" align="middle">
        <Col>
          <Row gutter={[8, 0]} align="middle">
            <CommonButton type="text" icon={<IconArrowLeft2 />} onClick={onClose}></CommonButton>
            <Col>
              <Font lineHeight={30} size={20} weight="bold">{`${unifyWTokenSymbol(pairInfo.token0)}/${unifyWTokenSymbol(
                pairInfo.token1,
              )}`}</Font>
            </Col>
            <Col>
              <FeeRate useBg>{formatPercentage(pairInfo?.feeRate * 100)}</FeeRate>
            </Col>
          </Row>
        </Col>
        <Col>
          <ManageLiquidityBtn useBtn pair={pairInfo} />
        </Col>
      </Row>
    </CommonCard>
  );
};
