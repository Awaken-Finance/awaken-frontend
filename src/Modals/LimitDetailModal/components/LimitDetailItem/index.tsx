import { Row, Col } from 'antd';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';
import CommonCopy from 'components/CommonCopy';
import { getExploreLink } from 'utils';
import { stringMidShort } from 'utils/string';
import { ZERO } from 'constants/misc';
import { LimitOrderStatusEnum, TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';
import { LIMIT_STATUS_WITH_GAS, LimitDetailStatusMap } from 'constants/limit';

import PriceUSDDigits from 'components/PriceUSDDigits';
import './styles.less';
import { useMemo } from 'react';
import { formatPriceChange } from 'utils/price';
import CommonTooltip from 'components/CommonTooltip';

export type TLimitDetailItemProps = {
  item: TLimitDetailItem;
  record?: TLimitRecordItem;
};

export default function LimitDetailItem({
  item: {
    transactionTime,
    amountInFilled,
    amountOutFilled,
    amountOutFilledUSD,
    networkFee,
    status,
    totalFee,
    transactionHash,
  },
  record,
}: TLimitDetailItemProps) {
  const { t } = useTranslation();
  const isPartiallyFilling = useMemo(() => status === LimitOrderStatusEnum.PartiallyFilling, [status]);
  const isNetworkFeeShow = useMemo(() => LIMIT_STATUS_WITH_GAS.includes(status), [status]);

  return (
    <Row className="limit-detail-list-item" gutter={[0, 8]}>
      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('time')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {moment(transactionTime).format('YYYY-MM-DD HH:mm:ss')}
        </Font>
      </Col>

      {isPartiallyFilling && (
        <>
          <Col span={12} className="height-20 line-height-20">
            <Font lineHeight={20} color="two">
              {t('price')}
            </Font>
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <PriceDigits
              className={getFontStyle({ lineHeight: 20 })}
              price={ZERO.plus(amountInFilled).div(amountOutFilled)}
            />
            &nbsp;
            <Font lineHeight={20} size={14}>
              {`${formatSymbol(record?.symbolIn)}/${formatSymbol(record?.symbolOut)}`}
            </Font>
          </Col>

          <Col span={12} className="height-20 line-height-20">
            <Font lineHeight={20} color="two">
              {t('Pay')}
            </Font>
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <Font lineHeight={20} size={14}>{`${formatPriceChange(amountInFilled)} ${formatSymbol(
              record?.symbolIn,
            )}`}</Font>
          </Col>

          <Col span={12} className="height-20 line-height-20 limit-detail-table-tip-mobile-wrap">
            <Font lineHeight={20} color="two">
              {t('Receive')}
            </Font>
            <CommonTooltip
              placement="topLeft"
              title={t('limitDetailReceiveDescription')}
              headerDesc={t('Receive')}
              buttonTitle={t('ok')}
            />
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <Font lineHeight={20} size={14}>{`${formatPriceChange(amountOutFilled)} ${formatSymbol(
              record?.symbolOut,
            )}`}</Font>
          </Col>

          <Col span={12} className="height-20 line-height-20">
            <Font lineHeight={20} color="two">
              {t('TotalValue')}
            </Font>
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={amountOutFilledUSD} />
          </Col>

          <Col span={12} className="height-20 line-height-20">
            <Font lineHeight={20} color="two">
              {t('Fee')}
            </Font>
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <Font lineHeight={20} size={14}>{`-${ZERO.plus(totalFee || 0)
              .dp(record?.tradePair.token1.decimals || 0)
              .toFixed()} ${formatSymbol(record?.symbolOut)}`}</Font>
          </Col>
        </>
      )}

      {isNetworkFeeShow && (
        <>
          <Col span={12} className="height-20 line-height-20">
            <Font lineHeight={20} color="two">
              {t('transactionFee')}
            </Font>
          </Col>
          <Col span={12} className="align-right height-20 line-height-20">
            <Font lineHeight={20} size={14}>
              {`-${ZERO.plus(networkFee ?? 0)
                .dp(8)
                .toFixed()} ELF`}
            </Font>
          </Col>
        </>
      )}

      <Col span={12} className="height-20 line-height-20">
        <Font lineHeight={20} color="two">
          {t('Status')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20 line-height-20">
        <Font lineHeight={20} size={14} color={LimitDetailStatusMap[status].color}>
          {t(LimitDetailStatusMap[status].label)}
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
    </Row>
  );
}
