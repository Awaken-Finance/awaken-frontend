import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage } from 'utils/price';
import CommonCopy from 'components/CommonCopy';

import './index.less';
import { getExploreLink } from 'utils';
import { stringMidShort } from 'utils/string';
import { ZERO } from 'constants/misc';
import { TLimitRecordItem } from 'types/transactions';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';
import { LimitOrderCancelAllowStatus, LimitOrderStatusMap } from 'constants/limit';
import { MutableRefObject } from 'react';
import { LimitCancelModalInterface } from 'Modals/LimitCancelModal';
import { LimitDetailModalInterface } from 'Modals/LimitDetailModal';

export type TLimitRecordItemProps = {
  item: TLimitRecordItem;
  limitCancelModalRef?: MutableRefObject<LimitCancelModalInterface | undefined>;
  limitDetailModalRef?: MutableRefObject<LimitDetailModalInterface | undefined>;
};

export default function LimitRecordItem({
  item: {
    tradePair,
    commitTime,
    symbolIn = '',
    symbolOut = '',
    amountIn = '',
    amountOut = '',
    amountInFilled = '',
    amountOutFilled = '',
    deadline,
    totalFee,
    networkFee = '',
    limitOrderStatus,
    transactionHash,
  },
  item,
  limitCancelModalRef,
  limitDetailModalRef,
}: TLimitRecordItemProps) {
  const { t } = useTranslation();

  return (
    <Row className="transaction-list-item" gutter={[0, 8]}>
      <Col span={24}>
        <Row align="top" wrap={false}>
          <Col className="transaction-list-item-pairs-wrap">
            <Pairs
              tokenA={tradePair?.token0?.symbol}
              tokenB={tradePair?.token1}
              lineHeight={20}
              weight="medium"
              isAutoOrder={false}
            />
          </Col>
        </Row>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Order Time')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font color="two" lineHeight={20}>
          {moment(commitTime).format('YYYY-MM-DD HH:mm:ss')}
        </Font>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Order Price')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={ZERO.plus(amountIn).div(amountOut)} />
        &nbsp;
        <Font lineHeight={20} size={14}>
          {`${formatSymbol(symbolIn)}/${formatSymbol(symbolOut)}`}
        </Font>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {`${t('Filled')}/${t('Pay')}`}
        </Font>
      </Col>
      <Col span={12} className="align-right">
        <div className="transaction-list-item-two-row-wrap">
          <Font lineHeight={20} size={14}>{`${amountInFilled} ${symbolIn}`}</Font>
          <Font lineHeight={20} size={14}>
            {`${amountIn} ${symbolIn}`}
          </Font>
        </div>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {`${t('Filled')}/${t('Receive')}`}
        </Font>
      </Col>
      <Col span={12} className="align-right">
        <div className="transaction-list-item-two-row-wrap">
          <Font lineHeight={20} size={14}>{`${amountOutFilled} ${symbolOut}`}</Font>
          <Font lineHeight={20} size={14}>
            {`${amountOut} ${symbolOut}`}
          </Font>
        </div>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Expires')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20} size={14}>
          {`${moment(deadline).format('YYYY-MM-DD HH:mm:ss')}`}
        </Font>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Fee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20} size={14}>{`${totalFee} ELF`}</Font>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('transactionFee')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20} size={14}>
          {`${networkFee} ELF`}
        </Font>
      </Col>

      <Col span={11} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('transactionID')}
        </Font>
      </Col>
      <Col span={13} className="align-right height-20 line-height-20">
        <Row align="middle">
          <Col>
            <a
              target="_blank"
              href={getExploreLink(transactionHash || '', 'transaction')}
              style={{ wordBreak: 'break-all' }}>
              {stringMidShort(transactionHash || '', 8)}
            </a>
          </Col>
          <Col>
            <CommonCopy copyInfo="" copyValue={transactionHash} className="copy-address"></CommonCopy>
          </Col>
        </Row>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Status')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font size={12} lineHeight={20} color={LimitOrderStatusMap[limitOrderStatus]?.color}>
          {t(LimitOrderStatusMap[limitOrderStatus]?.label)}
        </Font>
      </Col>

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Operation')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <div className="limit-operation-area">
          {LimitOrderCancelAllowStatus.includes(limitOrderStatus) && (
            <>
              <div className="limit-operation-btn" onClick={() => limitCancelModalRef?.current?.show({ record: item })}>
                {t('cancel')}
              </div>
              <div className="limit-operation-split" />
            </>
          )}
          <div className="limit-operation-btn" onClick={() => limitDetailModalRef?.current?.show({ record: item })}>
            {t('Details')}
          </div>
        </div>
      </Col>
    </Row>
  );
}
