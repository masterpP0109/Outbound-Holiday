import { StrictMode, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import {
  fetchContent,
  fetchCurrencyRates,
  getWpConfig,
  hasServerInitialContent,
  readInitialContent,
  seedInitialContentCache,
} from './runtime/api';
import {
  getCurrencyRevision,
  installContent,
  installCurrencyRates,
  subscribeCurrencyRates,
} from './runtime/catalog';
import './index.css';
import { installFetchLogging } from './runtime/fetch-log';

installFetchLogging();
const initial = readInitialContent();
const hasServer = hasServerInitialContent();
installContent(initial, { fromServer: hasServer });
seedInitialContentCache(initial, hasServer && !getWpConfig()?.isPreview);

function SiteLoader() {
  const [version, setVersion] = useState(initial.version);
  const currencyRev = useSyncExternalStore(
    subscribeCurrencyRates,
    getCurrencyRevision,
    getCurrencyRevision
  );

  useEffect(() => {
    let active = true;
    const isPreview = Boolean(getWpConfig()?.isPreview);

    const refresh = async (force = false) => {
      try {
        const content = await fetchContent(force);
        if (active) {
          installContent(content, { fromServer: true });
          setVersion(content.version);
        }
        if (!content.site.currencyMeta || content.site.currencyMeta.status !== 'live') {
          const liveRates = await fetchCurrencyRates();
          if (active && liveRates) {
            installCurrencyRates(liveRates.rates, liveRates.meta, true);
          }
        }
      } catch {
        const liveRates = await fetchCurrencyRates();
        if (active && liveRates) {
          installCurrencyRates(liveRates.rates, liveRates.meta, true);
        }
      }
    };

    let idleTimer: number | undefined;
    if (isPreview || !hasServer) {
      // Admin preview or local dev without inline snapshot: load fresh immediately.
      void refresh(isPreview);
    } else if (!initial.site.currencyMeta || initial.site.currencyMeta.status !== 'live') {
      // Server/prerendered HTML already has full catalog; only refresh lightweight currency rates once idle.
      idleTimer = window.setTimeout(() => {
        void fetchCurrencyRates().then((liveRates) => {
          if (active && liveRates) {
            installCurrencyRates(liveRates.rates, liveRates.meta, true);
          }
        });
      }, 600);
    }

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => void refresh(), 60000);
    return () => {
      active = false;
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return <App contentVersion={`${version}-${currencyRev}`} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteLoader />
  </StrictMode>
);
