import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/index.css';
import './wp-overrides.css';
import { installContent } from '../../src/runtime/catalog';
import { fetchContent, getWpConfig, readInitialContent } from '../../src/runtime/api';
import App from '../../src/App';

const initialSnapshot = readInitialContent();
installContent(initialSnapshot);

function OutboundWordPressApp() {
  const [contentVersion, setContentVersion] = useState(initialSnapshot.version || '1');
  const wpCfg = getWpConfig();

  useEffect(() => {
    let active = true;
    fetchContent()
      .then((latest) => {
        if (active) {
          installContent(latest);
          setContentVersion(`${latest.version || '1'}-${Date.now()}`);
        }
      })
      .catch(() => {
        /* Initial server-injected #outbound-content snapshot remains active. */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <App
      initialPath={wpCfg?.initialRoutePath || undefined}
      contentVersion={contentVersion}
    />
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
