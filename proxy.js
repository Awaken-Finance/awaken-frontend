const apiEnv = process.env.REACT_APP_API_ENV;
const mainNetApi = {
  nodeApi: 'http://192.168.66.55:8901',
  webApi: 'http://192.168.66.55:8900/',
  cmsApi: 'http://192.168.66.186:6776/', // 'http://192.168.66.186:6776/', // inner
  farmApi: 'http://192.168.66.55:8900/',
  portkeyApi: 'https://did-portkey.portkey.finance',
  portkeyAuthApi: 'https://auth-portkey.portkey.finance',
  portkeyIndexer: 'https://dapp-portkey.portkey.finance',
};

const testNetApi = {
  nodeApi: 'https://test.awaken.finance',
  webApi: 'https://test.awaken.finance',
  cmsApi: 'https://test-cms.awaken.finance',
  farmApi: 'http://192.168.66.55:8900/',
  portkeyApi: 'https://did-portkey-test.portkey.finance',
  portkeyAuthApi: 'https://auth-portkey-test.portkey.finance',
  portkeyIndexer: 'https://dapp-portkey-test.portkey.finance',
};

const testApi = {
  nodeApi: 'http://192.168.67.216:5006',
  webApi: 'http://192.168.67.216:5006',
  cmsApi: 'http://192.168.67.216:3106', // test2
  farmApi: 'http://192.168.66.55:8900/',
  portkeyApi: 'http://192.168.66.203:5001',
  portkeyAuthApi: 'https://auth-portkey-test.portkey.finance',
  portkeyIndexer: 'http://192.168.66.203:8083',
};

const localApi = {
  nodeApi: 'http://192.168.67.216:5006',
  webApi: 'http://192.168.67.216:5006',
  cmsApi: 'http://192.168.66.62:3106', // test2
  farmApi: 'http://192.168.66.55:8900/',
  portkeyApi: 'http://192.168.66.203:5001',
  portkeyAuthApi: 'https://auth-portkey-test.portkey.finance',
  portkeyIndexer: 'http://192.168.66.203:8083',
};

if (apiEnv === 'preview') {
  module.exports = testNetApi;
} else if (apiEnv === 'test') {
  module.exports = testApi;
} else if (apiEnv === 'local') {
  module.exports = localApi;
} else {
  module.exports = mainNetApi;
}
