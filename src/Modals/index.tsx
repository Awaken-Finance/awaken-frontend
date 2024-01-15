import AccountModal from './AccountModal';
import SelectTokenModal from './SelectTokenModal';
// import ManageModal from './ManageModal';
import TransactionSettingsModal from './TransactionSettingsModal';
import TooltipModal from './TooltipModal';
import ExpertModeModal from './ExpertModeModal';
import SynchronizedAccountInfoModal from './SynchronizedAccountInfoModal';
export default function Modals() {
  return (
    <>
      {/* <NetworkModal /> */}
      <AccountModal />
      {/* <WalletModal /> */}
      {/* <CreatePairModal /> */}
      {/* <ManageLiquidityModal /> */}
      <TransactionSettingsModal />
      <SelectTokenModal />
      {/* <ManageModal /> */}
      {/* <ImportTokenModal /> */}
      <TooltipModal />
      <ExpertModeModal />
      <SynchronizedAccountInfoModal />
    </>
  );
}
