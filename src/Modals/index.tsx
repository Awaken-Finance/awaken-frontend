import AccountModal from './AccountModal';
import SelectTokenModal from './SelectTokenModal';
// import ManageModal from './ManageModal';
import TransactionSettingsModal from './TransactionSettingsModal';
import TooltipModal from './TooltipModal';
import ExpertModeModal from './ExpertModeModal';
import SynchronizedAccountInfoModal from './SynchronizedAccountInfoModal';
import SwapNotSupportedModal from './SwapNotSupportedModal';
export default function Modals() {
  return (
    <>
      {/* <NetworkModal /> */}
      <AccountModal />
      {/* <WalletModal /> */}
      {/* <CreatePairModal /> */}
      <TransactionSettingsModal />
      <SelectTokenModal />
      {/* <ManageModal /> */}
      {/* <ImportTokenModal /> */}
      <TooltipModal />
      <ExpertModeModal />
      <SynchronizedAccountInfoModal />
      <SwapNotSupportedModal />
    </>
  );
}
