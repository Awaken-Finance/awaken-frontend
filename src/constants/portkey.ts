export const PORTKEY_SERVICE = {
  local: {
    v1: {
      graphQLUrl: 'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
      apiServer: 'http://192.168.66.203:5001',
      connectServer: 'http://192.168.66.203:8001',
    },
    v2: {
      graphQLUrl: 'http://192.168.67.99:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://test3-applesign-v2.portkey.finance',
      connectServer: 'http://192.168.67.127:8080',
    },
  },
  test: {
    v1: {
      graphQLUrl: 'http://192.168.66.203:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
      apiServer: 'http://192.168.66.203:5001',
      connectServer: 'http://192.168.66.203:8001',
    },
    v2: {
      graphQLUrl: 'http://192.168.67.99:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://test3-applesign-v2.portkey.finance',
      connectServer: 'http://192.168.67.127:8080',
    },
  },
  preview: {
    v1: {
      graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://did-portkey-test.portkey.finance',
      connectServer: 'https://auth-portkey-test.portkey.finance',
    },
    v2: {
      graphQLUrl: 'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://aa-portkey-test.portkey.finance',
      connectServer: 'https://auth-aa-portkey-test.portkey.finance',
    },
  },
  main: {
    v1: {
      graphQLUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://did-portkey.portkey.finance',
      connectServer: 'https://auth-portkey.portkey.finance',
    },
    v2: {
      graphQLUrl: 'https://dapp-aa-portkey.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
      apiServer: 'https://aa-portkey.portkey.finance',
      connectServer: 'https://auth-aa-portkey.portkey.finance',
    },
  },
};
