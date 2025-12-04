import * as Sentry from '@sentry/react';

const isProduction = process.env.NODE_ENV === 'production';
const apiEnv = process.env.REACT_APP_API_ENV || 'mainnet';
const isTestnet = apiEnv === 'preview';
const isMainnet = apiEnv === 'mainnet';

if (isProduction && (isMainnet || isTestnet)) {
  console.log('sentry init');
  Sentry.init({
    dsn: 'https://a99bf8958c04986b97753be455cd09f4@o4505006413840384.ingest.sentry.io/4505638874710016',
    environment: apiEnv,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    release: '1.1.0',
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}
