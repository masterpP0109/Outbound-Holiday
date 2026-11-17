import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { gzipSync } from 'node:zlib';
import handler from './handler';
import { db } from './db';
import { allowedOrigins } from './origins';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Render's own reverse proxy is one trusted hop; never trust arbitrary forwarded addresses.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 1));
  const origins = allowedOrigins();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || origins.includes(origin)) callback(null, true);
      else callback(Object.assign(new Error('Origin is not allowed.'), { status: 403 }));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Idempotency-Key', 'Authorization', 'If-None-Match'],
    exposedHeaders: ['ETag', 'Retry-After', 'Content-Disposition'],
    maxAge: 600,
  }));

  // Gzip-compress JSON & HTML API payloads >= 1 KB to cut transfer size ~85% without extra deps.
  app.use((req, res, next) => {
    const acceptEnc = String(req.headers['accept-encoding'] || '');
    if (!/\bgzip\b/i.test(acceptEnc) || req.method === 'HEAD') {
      return next();
    }
    const origJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (res.headersSent) return origJson(body);
      const raw = Buffer.from(JSON.stringify(body));
      if (raw.length < 1024) {
        return origJson(body);
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      const gz = gzipSync(raw, { level: 6 });
      res.setHeader('Content-Length', String(gz.length));
      return res.send(gz);
    }) as typeof res.json;
    next();
  });

  app.use(express.json({ limit: '32kb', strict: true }));
  app.use('/api/v1/newsletter', express.urlencoded({ limit: '8kb', extended: false }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'outbound-api' }));
  app.get('/ready', async (_req, res) => {
    try {
      await db.$queryRawUnsafe('SELECT 1');
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ error: 'Database is unavailable.' });
    }
  });
  app.use('/api/v1', async (req, res) => { await handler(req, res); });
  app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = error.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : error.status ?? 500;
    res.status(status).json({
      error: status === 413
        ? 'Request is too large.'
        : status === 400
          ? 'Malformed JSON request.'
          : status === 403
            ? 'Origin is not allowed.'
            : 'Service temporarily unavailable.',
    });
  });
  return app;
}
