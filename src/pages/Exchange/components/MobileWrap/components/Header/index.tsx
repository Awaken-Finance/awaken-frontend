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
import { Pairs } from 'components/Pair';

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
    <Row className="mobile-header" wrap={false}>
      <Col>
        <CommonButton type="text" icon={<IconSwitchPair />} onClick={openTradePair} />
      </Col>
      <Col flex={1} className="symbol">
        <Pairs
          size={20}
          lineHeight={30}
          weight="bold"
          tokenA={pairInfo.token0}
          tokenB={pairInfo.token1}
          maxLenth={10}
        />
        <FeeRate useBg className="mobile-header-feeRate">
          {formatPercentage(new BigNumber(pairInfo?.feeRate ?? 0).times(100))}
        </FeeRate>
      </Col>
      <Col>
        <CommonButton type="text" icon={<IconOpenKLine />} onClick={openKlinePage} />
      </Col>
      <Col>
        <CollectionBtnInList isFav={pairInfo?.isFav} favId={pairInfo?.favId} id={pairInfo?.id} />
      </Col>
    </Row>
  );
}
