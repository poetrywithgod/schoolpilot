/// <reference types="vite/client" />
// apps/super-admin/src/instrument.ts

import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://1987d18b78bd6ff4f2b7518dd2740b39@o4511722590765056.ingest.de.sentry.io/4511722604200016',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
})
