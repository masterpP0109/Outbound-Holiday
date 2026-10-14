import { createApp } from './app';
import type { AddressInfo } from 'node:net';
// Adapt the existing Express API to Neon's web-standard fetch handler.
const ready = new Promise<string>((resolve, reject) => {
  const server = createApp().listen(0, '127.0.0.1', () => {
    resolve('http://127.0.0.1:' + (server.address() as AddressInfo).port);
  });
  server.on('error', reject);
  server.unref();
});
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-forwarded-for');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-proto');
    let body: Uint8Array | undefined;
    if (request.body) {
      const reader = request.body.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 32768) {
          await reader.cancel();
          return Response.json({ error: 'Request is too large.' }, { status: 413 });
        }
        chunks.push(value);
      }
      body = Buffer.concat(chunks, bytes);
    }
    return fetch((await ready) + url.pathname + url.search, { method: request.method, headers, body, redirect: 'manual' });
  },
};
