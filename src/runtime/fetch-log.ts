/** Log request metadata only: bodies, headers, and query values may contain private data. */
export function installFetchLogging(target: Pick<Window, 'fetch' | 'location'> = window) {
  const originalFetch = target.fetch.bind(target);
  let sequence = 0;
  target.fetch = async (input, init) => {
    const id = ++sequence;
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const rawUrl = input instanceof Request ? input.url : String(input);
    let url = '[invalid URL]';
    try {
      const parsed = new URL(rawUrl, target.location.href);
      url = parsed.origin + parsed.pathname;
    } catch { /* Let fetch report invalid URLs normally. */ }
    const label = `[Fetch #${id}] ${method} ${url}`;
    const started = performance.now();
    console.info(`${label} — started`, { time: new Date().toISOString() });
    try {
      const response = await originalFetch(input, init);
      const duration = `${Math.round(performance.now() - started)} ms`;
      if (response.ok || response.status === 304) {
        console.info(`${label} — completed (${response.status}, ${duration})`);
      } else {
        console.warn(`${label} — HTTP error (${response.status}, ${duration})`);
      }
      return response;
    } catch (error) {
      const duration = `${Math.round(performance.now() - started)} ms`;
      const reason = error instanceof Error ? error.name : 'Unknown error';
      console.error(`${label} — failed (${reason}, ${duration}). Check the Network tab for details; network and CORS failures may hide the HTTP status.`);
      throw error;
    }
  };
}
