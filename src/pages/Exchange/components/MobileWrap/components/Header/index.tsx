import { Row, Col } from 'antd';
import Font from 'components/Font';
import FeeRate from 'components/FeeRate';

import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import { IconOpenKLine, IconSwitchPair } from 'assets/icons';
import { formatPercentage } from 'utils/price';
import BigNumber from 'bignumber.js';

import './index.less';
import CommonButton from 'components/CommonButton';

export default function Header({
  openKlinePage,
  openTradePair,
}: {
  openKlinePage?: () => void;
  openTradePair: () => void;
}) {
  const [{ pairInfo }] = useSwapContext();

  if (!pairInfo) {
    return null;
  }

  return (
    <Row className="mobile-header" justify="space-between" align="middle">
      <Row gutter={[8, 0]} align="middle">
        <CommonButton type="text" icon={<IconSwitchPair />} onClick={openTradePair} />
        <Col>
          <Font lineHeight={30} size={20} weight="bold">{`${pairInfo?.token0.symbol}/${pairInfo?.token1.symbol}`}</Font>
        </Col>
        <Col>
          <FeeRate useBg>{formatPercentage(new BigNumber(pairInfo?.feeRate ?? 0).times(100))}</FeeRate>
        </Col>
      </Row>
      <Row justify="end" gutter={[0, 0]} align="middle">
        <Col>
          <CommonButton type="text" icon={<IconOpenKLine />} onClick={openKlinePage} />
        </Col>
        <Col>
          <CollectionBtnInList isFav={pairInfo?.isFav} favId={pairInfo?.favId} id={pairInfo?.id} />
        </Col>
      </Row>
    </Row>
  );
}
