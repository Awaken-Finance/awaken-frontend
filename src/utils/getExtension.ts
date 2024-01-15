import isMobile from 'utils/isMobile';

const getExtension = () => {
  const { android, apple } = isMobile();
  if (android.device) {
    return window.open('https://aelf.com/app/wallet-app.apk', 'blank');
  }
  if (apple.phone || apple.tablet) {
    return window.open('https://apps.apple.com/us/app/aelf-official-wallet/id1507344137', 'blank');
  }

  window.open(
    'https://chrome.google.com/webstore/detail/aelf-explorer-extension/mlmlhipeonlflbcclinpbmcjdnpnmkpf?hl=zh-CN',
    'blank',
  );
};
export default getExtension;
