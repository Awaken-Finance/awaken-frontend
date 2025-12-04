import { Col, Row } from 'antd';
import ApproveBtn from '.';
import { Currency } from '@awaken/sdk-core';
import { useEffect, useMemo, useState } from 'react';
import { getCurrencyAddress } from 'utils/swap';
import { Outputs } from 'types/swap';
import BigNumber from 'bignumber.js';

export type ApproveButtonsRowState = {
  leftApproved: boolean;
  rightApproved: boolean;
  leftApproveRequired: boolean;
  rightApproveRequired: boolean;
};

export type ApproveButtonsRowProps = {
  leftToken: Currency | undefined;
  rightToken: Currency | undefined;
  inputs: Outputs | undefined;
  tokenContractAddress: string | undefined;
  routerAddress: string | undefined;
  onApproveStateChange: (state: ApproveButtonsRowState) => void;
};

export default function ApproveButtonsRow({
  leftToken,
  rightToken,
  tokenContractAddress,
  routerAddress,
  inputs,
  onApproveStateChange,
}: ApproveButtonsRowProps) {
  const [leftApproved, setLeftApproved] = useState(false);
  const [rightApproved, setRightApproved] = useState(false);

  const [leftQueryed, setLeftQueryed] = useState(false);
  const [rightQueryed, setRightQueryed] = useState(false);

  const [leftApproveRequired, setLeftApproveRequired] = useState(false);
  const [rightApproveRequired, setRightApproveRequired] = useState(false);

  const leftInput = inputs?.[getCurrencyAddress(leftToken)];
  const rightInput = inputs?.[getCurrencyAddress(rightToken)];

  const leftInputBN = useMemo(() => {
    if (!leftInput) {
      return new BigNumber(0);
    }
    return new BigNumber(leftInput);
  }, [leftInput]);

  const rightInputBN = useMemo(() => {
    if (!rightInput) {
      return new BigNumber(0);
    }
    return new BigNumber(rightInput);
  }, [rightInput]);

  useEffect(() => {
    onApproveStateChange({
      leftApproved,
      rightApproved,
      leftApproveRequired,
      rightApproveRequired,
    });
  }, [leftApproved, rightApproved, leftApproveRequired, rightApproveRequired, onApproveStateChange]);

  const leftSpan = useMemo(() => {
    if (!leftQueryed) return 0;
    if (leftApproveRequired && rightApproveRequired) {
      return 12;
    }
    if (leftApproveRequired && !rightApproveRequired) {
      return 24;
    }
    return 0;
  }, [leftApproveRequired, leftQueryed, rightApproveRequired]);

  const rightSpan = useMemo(() => {
    if (!rightQueryed) return 0;
    if (leftApproveRequired && rightApproveRequired) {
      return 12;
    }
    if (!leftApproveRequired && rightApproveRequired) {
      return 24;
    }
    return 0;
  }, [leftApproveRequired, rightApproveRequired, rightQueryed]);

  return (
    <Row gutter={[12, 0]}>
      <Col span={leftSpan}>
        <ApproveBtn
          key="left"
          type="primary"
          size="large"
          ellipsis
          symbol={leftToken?.symbol}
          tokenContractAddress={tokenContractAddress}
          approveTargetAddress={routerAddress}
          approveBN={leftInputBN}
          approveInput={leftInput || ''}
          token={leftToken}
          style={{ width: leftSpan > 0 ? '100%' : '0%' }}
          onApproveStateChange={(approved, hasQueryToken) => {
            setLeftApproved(approved);
            setLeftQueryed(hasQueryToken);
          }}
          onAllowanceChange={(_, approveRequired) => setLeftApproveRequired(approveRequired)}
        />
      </Col>
      <Col span={rightSpan}>
        <ApproveBtn
          key="right"
          type="primary"
          size="large"
          ellipsis
          symbol={rightToken?.symbol}
          tokenContractAddress={tokenContractAddress}
          approveTargetAddress={routerAddress}
          approveBN={rightInputBN}
          approveInput={rightInput || ''}
          token={rightToken}
          style={{ width: rightSpan > 0 ? '100%' : '0%' }}
          onApproveStateChange={(approved, hasQueryToken) => {
            setRightApproved(approved);
            setRightQueryed(hasQueryToken);
          }}
          onAllowanceChange={(_, approveRequired) => setRightApproveRequired(approveRequired)}
        />
      </Col>
    </Row>
  );
}
