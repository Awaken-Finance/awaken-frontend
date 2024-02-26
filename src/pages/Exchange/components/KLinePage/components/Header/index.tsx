import { Col, Row } from 'antd';

import CommonCard from 'components/CommonCard';
import FeeRate from 'components/FeeRate';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import { Pairs } from 'components/Pair';
import CommonButton from 'components/CommonButton';

import { PoolItem } from 'types';
import { formatPercentage } from 'utils/price';
import { IconArrowLeft2 } from 'assets/icons';

import './style.less';

export default ({ pairInfo, onClose }: { pairInfo: PoolItem; onClose: () => void }) => {
  return (
    <CommonCard title={null} className="kline-header">
      <Row justify="space-between" wrap={false}>
        <Col>
          <CommonButton type="text" icon={<IconArrowLeft2 />} onClick={onClose}></CommonButton>
        </Col>
        <Col flex={1} className="symbol">
          <Pairs size={20} lineHeight={30} weight="bold" tokenA={pairInfo.token0} tokenB={pairInfo.token1} />
          <FeeRate useBg className="kline-header-feeRate">
            {formatPercentage(pairInfo?.feeRate * 100)}
          </FeeRate>
        </Col>
        <Col className="add-button">
          <ManageLiquidityBtn useBtn pair={pairInfo} />
        </Col>
      </Row>
    </CommonCard>
  );
};
