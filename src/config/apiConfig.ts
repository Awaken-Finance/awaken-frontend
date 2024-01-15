const API_ENV = process.env.REACT_APP_API_ENV || 'mainnet';

export type ApiConfig = {
  socket: string;
  explorer: string;
};

const apiConfig: { [key: string]: ApiConfig } = {
  local: {
    socket: 'http://192.168.67.216:5006',
    explorer: 'http://192.168.66.216:8000/swagger/index.html?',
  },
  test: {
    socket: 'http://192.168.67.216:5006',
    explorer: 'http://192.168.66.216:8000/swagger/index.html?',
  },
  preview: {
    socket: 'https://test.awaken.finance',
    explorer: 'http://explorer-test-side02.aelf.io',
  },
  mainnet: {
    socket: 'https://awaken.finance',
    explorer: 'https://tdvv-explorer.aelf.io',
  },
};

export default apiConfig[API_ENV as string];
