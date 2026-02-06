import {
  ComponentStyle,
  Deposit,
  useETransferDeposit,
  useETransferWithdraw,
  useNoticeSocket,
  Withdraw,
} from '@etransfer/ui-react';
import { TDepositActionData } from '@etransfer/ui-react/dist/_types/src/components/Deposit/types';
import { TWithdrawActionData } from '@etransfer/ui-react/dist/_types/src/components/Withdraw/types';
import { useMobile } from 'utils/isMobile';

export type TETransferContentBodyProps = {
  isDeposit: boolean;
  onDepositActionChange?: (action: TDepositActionData) => void;
  onWithdrawActionChange?: (action: TWithdrawActionData) => void;
};

export const ETransferContentBody = ({
  isDeposit,
  onDepositActionChange,
  onWithdrawActionChange,
}: TETransferContentBodyProps) => {
  const isMobile = useMobile();
  const [{ depositProcessingCount }] = useETransferDeposit();
  const [{ withdrawProcessingCount }] = useETransferWithdraw();
  useNoticeSocket();

  return isDeposit ? (
    <Deposit
      componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
      isListenNoticeAuto={false}
      isShowProcessingTip={true}
      onActionChange={onDepositActionChange}
      withdrawProcessingCount={withdrawProcessingCount}
    />
  ) : (
    <Withdraw
      componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
      isListenNoticeAuto={false}
      isShowProcessingTip={true}
      onActionChange={onWithdrawActionChange}
      depositProcessingCount={depositProcessingCount}
    />
  );
};
