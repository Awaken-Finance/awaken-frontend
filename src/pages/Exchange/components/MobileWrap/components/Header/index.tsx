import { Row, Col } from 'antd';
import FeeRate from 'components/FeeRate';

import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import { IconSwitchPair } from 'assets/icons';
import { formatPercentage } from 'utils/price';
import BigNumber from 'bignumber.js';

import './index.less';
import CommonButton from 'components/CommonButton';
import { Pairs } from 'components/Pair';

export default function Header({ openTradePair }: { openKlinePage?: () => void; openTradePair: () => void }) {
  const [{ pairInfo }] = useSwapContext();

  if (!pairInfo) {
    return null;
  }

  return (
    <Row className="mobile-header" wrap={false} align={'middle'}>
      <Col>
        <CommonButton className="switch-pair-button" type="text" icon={<IconSwitchPair />} onClick={openTradePair} />
      </Col>
      <Col flex={1} className="symbol">
        <Row wrap={false} align={'top'}>
          <Col flex={1}>
            <Row wrap={false}>
              <Pairs size={20} lineHeight={24} weight="bold" tokenA={pairInfo.token0} tokenB={pairInfo.token1} />
              <FeeRate useBg className="mobile-header-feeRate">
                {formatPercentage(new BigNumber(pairInfo?.feeRate ?? 0).times(100))}
              </FeeRate>
            </Row>
          </Col>
          <Col>
            <CollectionBtnInList isFav={pairInfo?.isFav} favId={pairInfo?.favId} id={pairInfo?.id} />
          </Col>
        </Row>
      </Col>
      {/* <Col className="add-button">
        <ManageLiquidityBtn useBtn pair={pairInfo} />
      </Col> */}
    </Row>
  );
}
