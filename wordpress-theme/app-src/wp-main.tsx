import { StrictMode, useEffect, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import './wp-overrides.css';
import { getCurrencyRevision, installContent, installCurrencyRates, subscribeCurrencyRates } from '../../src/runtime/catalog';
import { fetchContent, fetchCurrencyRates, getLastSnapshotError, getWpConfig, hasServerInitialContent, readInitialContent } from '../../src/runtime/api';
import App from '../../src/App';

const initialSnapshot = readInitialContent();
installContent(initialSnapshot, { fromServer: hasServerInitialContent() });

function OutboundWordPressApp() {
  const [contentVersion, setContentVersion] = useState(initialSnapshot.version || '1');
  const [snapshotError, setSnapshotError] = useState<string | null>(() => getLastSnapshotError());
  const currencyRev = useSyncExternalStore(subscribeCurrencyRates, getCurrencyRevision, getCurrencyRevision);
  const wpCfg = getWpConfig();

  useEffect(() => {
    let active = true;
    fetchContent(true)
      .then(async (latest) => {
        if (active) {
          installContent(latest, { fromServer: true });
          setSnapshotError(null);
          setContentVersion(`${latest.version || '1'}-${Date.now()}`);
        }
        if (!latest.site.currencyMeta || latest.site.currencyMeta.status !== 'live') {
          const liveRates = await fetchCurrencyRates();
          if (active && liveRates) {
            installCurrencyRates(liveRates.rates, liveRates.meta, true);
          }
        }
      })
      .catch(async (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Outbound CMS] Live CMS snapshot refresh failed:', msg);
        if (active) {
          setSnapshotError(msg);
        }
        const liveRates = await fetchCurrencyRates();
        if (active && liveRates) {
          installCurrencyRates(liveRates.rates, liveRates.meta, true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <App
        initialPath={wpCfg?.initialRoutePath || undefined}
        contentVersion={`${contentVersion}-${currencyRev}`}
      />
      {wpCfg?.isPreview && snapshotError ? (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999,
            maxWidth: 420,
            background: '#991b1b',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 13,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          }}
        >
          <strong>Outbound CMS Preview Warning:</strong> {snapshotError}
        </div>
      ) : null}
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <OutboundWordPressApp />
    </StrictMode>,
  );
}
