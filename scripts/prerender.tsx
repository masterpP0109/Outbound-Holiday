import { loadPublishedContent } from './load-content';
import { getSnapshot, installContent } from '../src/runtime/catalog';
import { renderToPipeableStream } from 'react-dom/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { PassThrough } from 'node:stream';
import App from '../src/App';
import { getRouteOgImage, PAGE_ROUTES, resolveRoute, SITE_URL, PageRoute } from '../src/routes';

installContent(await loadPublishedContent());

function renderAppToStringAsync(element: React.ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);

    const { pipe } = renderToPipeableStream(element, {
      onAllReady() {
        pipe(stream);
      },
      onShellError(err) {
        reject(err);
      },
      onError(err) {
        console.error('Prerender warning:', err);
      },
    });
  });
}

const template = await readFile('dist/index.html', 'utf8');
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paths = new Set(PAGE_ROUTES.map((route) => route.path));
if (paths.size !== PAGE_ROUTES.length) throw new Error('Duplicate page URLs in route registry');

async function writePage(route: PageRoute, filename: string) {
  const isArticle = route.view === 'blog-post' || route.view === 'guide';
  const ogImage = getRouteOgImage(route);
  const extraOgTags = [
    `<meta property="og:type" content="${isArticle ? 'article' : 'website'}" />`,
    ...(ogImage ? [`<meta property="og:image" content="${escape(ogImage)}" />`] : []),
  ].join('\n');

  const renderedApp = await renderAppToStringAsync(<App initialPath={route.path} />);
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(route.description)}" />`)
    .replace('</head>', `<link rel="canonical" href="${SITE_URL}${route.path}" />\n<meta name="robots" content="${['not-found', 'newsletter-confirmed'].includes(route.view) ? 'noindex, follow' : 'index, follow'}" />\n<meta property="og:title" content="${escape(route.title)}" />\n<meta property="og:description" content="${escape(route.description)}" />\n<meta property="og:url" content="${SITE_URL}${route.path}" />\n${extraOgTags}\n</head>`)
    .replace('</head>', () => '<script type="application/json" id="outbound-content">' + JSON.stringify(getSnapshot()).replaceAll('<', '\\u003c') + '</script></head>')
    .replace('<div id="root"></div>', () => `<div id="root">${renderedApp}</div>`);
  await mkdir(dirname(filename), { recursive: true });
  await writeFile(filename, html);
}

for (const route of PAGE_ROUTES) {
  await writePage(route, route.path === '/' ? 'dist/index.html' : join('dist', `${route.path.slice(1)}.html`));
}
await writePage(resolveRoute('/404'), 'dist/404.html');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.w3.org/2000/svg" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`.includes('xmlns')
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGE_ROUTES.filter((route) => route.view !== 'newsletter-confirmed').map((route) => `  <url><loc>${SITE_URL}${route.path}</loc></url>`).join('\n')}\n</urlset>\n`
  : '');
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Prerendered ${PAGE_ROUTES.length} pages, a 404 page, sitemap.xml and robots.txt.`);
