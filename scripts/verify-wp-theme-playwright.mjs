/**
 * Automated Chromium Visual, Responsive & Functional Side-by-Side Verification:
 * Compares the original React production build (`dist/`) directly against
 * the rendered WordPress PHP theme (`tests/wp-render-harness.php`) across
 * Desktop (1440px), Tablet (768px), and Mobile (375px), capturing real screenshots
 * and verifying interactive flows, image loading, zero console errors, and layout parity.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const WP_PORT = 8089;
const REACT_PORT = 4173;
const WP_BASE = `http://127.0.0.1:${WP_PORT}`;
const REACT_BASE = `http://127.0.0.1:${REACT_PORT}`;
const distDir = path.resolve('dist');
const shotDir = process.env.SHOT_DIR || path.resolve('.tmp-wp-screenshots');
fs.mkdirSync(shotDir, { recursive: true });

// Minimal static server over original compiled `dist/` with SPA fallback
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const reactServer = http.createServer((req, res) => {
  const rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (rawPath.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not mocked' }));
    return;
  }
  const cleanRel = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  let target = path.join(distDir, cleanRel);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    target = path.join(target, 'index.html');
  }
  if (!fs.existsSync(target) || !target.startsWith(distDir)) {
    const htmlCandidate = path.join(distDir, cleanRel, 'index.html');
    target = fs.existsSync(htmlCandidate) ? htmlCandidate : path.join(distDir, 'index.html');
  }
  const ext = path.extname(target).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

await new Promise((resolve) => reactServer.listen(REACT_PORT, '127.0.0.1', resolve));

const phpServer = spawn('php', ['-S', `127.0.0.1:${WP_PORT}`, 'tests/wp-render-harness.php'], {
  stdio: 'ignore',
});

await new Promise((r) => setTimeout(r, 1200));

let browser;
const metricsReport = [];

try {
  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  browser = await chromium.launch({ executablePath: chromePath, headless: true });

  const consoleErrors = [];
  const pageErrors = [];
  const failedAssets = [];

  async function inspectSite(page, label, baseUrl, route, vp, saveShotName) {
    console.log(`Visiting [${label}:${vp.name}] ${route}`);
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('#root h1', { timeout: 10000 });
    await page.waitForTimeout(700);

    const stats = await page.evaluate(() => {
      const toRenderedRgba = (cssColor) => {
        if (!cssColor) return '';
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return cssColor;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = '#00000000';
        ctx.fillStyle = cssColor;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
        return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`;
      };
      const imgs = Array.from(document.querySelectorAll('img'));
      const brokenImgs = imgs
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute('src') || 'empty');
      const h1 = document.querySelector('h1');
      const header = document.querySelector('header');
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const darkHero = document.querySelector('.travel-hero, section[class*="bg-[#0D2833]"], header[class*="bg-[#0D2833]"]');
      const heroSub = darkHero ? darkHero.querySelector('.travel-hero-tagline, p') : null;
      return {
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
        h1Text: h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : '',
        h1Font: h1Style ? `${h1Style.fontFamily} @ ${h1Style.fontSize}` : 'none',
        h1Color: h1Style ? toRenderedRgba(h1Style.color) : '',
        heroSubtitleColor: heroSub ? toRenderedRgba(getComputedStyle(heroSub).color) : '',
        hasDarkHero: Boolean(darkHero),
        imgCount: imgs.length,
        brokenImgs,
      };
    });

    if (stats.overflow) {
      throw new Error(`[${label}] Horizontal overflow on ${route} at ${vp.name} (${stats.scrollWidth} > ${stats.innerWidth})`);
    }
    if (stats.brokenImgs.length > 0) {
      throw new Error(`[${label}] Broken images on ${route} at ${vp.name}: ${stats.brokenImgs.join(', ')}`);
    }

    if (saveShotName) {
      await page.screenshot({ path: path.join(shotDir, saveShotName), fullPage: false });
    }

    return stats;
  }

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  // Compare Homepage & Key Subpages Side-by-Side (React dist/ vs WordPress PHP Theme)
  const wpConsoleErrors = [];
  const wpPageErrors = [];
  const wpFailedAssets = [];

  for (const vp of viewports) {
    const reactCtx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const reactPage = await reactCtx.newPage();

    const wpCtx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const wpPage = await wpCtx.newPage();
    wpPage.on('console', (msg) => { if (msg.type() === 'error') wpConsoleErrors.push(`[WP:${vp.name}] ${msg.text()}`); });
    wpPage.on('pageerror', (err) => wpPageErrors.push(`[WP:${vp.name}] ${err.message}`));
    wpPage.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('/api/')) wpFailedAssets.push(`[WP:${vp.name}] ${res.status()} ${res.url()}`);
    });

    for (const route of [
      '/',
      '/victoria-falls-accommodation',
      '/things-to-do-in-victoria-falls',
      '/victoria-falls-packages',
      '/blog',
      '/blog/first-time-visitor-guide',
      '/contact',
    ]) {
      const slug = route === '/' ? 'home' : route.replace(/^\/+/, '').replace(/\//g, '-');
      const shouldShot = ['home', 'victoria-falls-accommodation', 'blog'].includes(slug) && vp.name !== 'tablet';
      const reactStats = await inspectSite(reactPage, 'React', REACT_BASE, route, vp, shouldShot ? `react-${slug}-${vp.name}.png` : null);
      const wpStats = await inspectSite(wpPage, 'WP', WP_BASE, route, vp, shouldShot ? `wp-${slug}-${vp.name}.png` : null);

      metricsReport.push({
        viewport: vp.name,
        route,
        reactH1: reactStats.h1Text,
        wpH1: wpStats.h1Text,
        reactH1Color: reactStats.h1Color,
        wpH1Color: wpStats.h1Color,
        reactHeaderH: reactStats.headerHeight,
        wpHeaderH: wpStats.headerHeight,
        reactH1Font: reactStats.h1Font,
        wpH1Font: wpStats.h1Font,
      });

      if (reactStats.h1Text !== wpStats.h1Text) {
        throw new Error(`H1 mismatch on ${route} (${vp.name}): React="${reactStats.h1Text}" vs WP="${wpStats.h1Text}"`);
      }
      if (reactStats.h1Color !== wpStats.h1Color) {
        throw new Error(`H1 color mismatch on ${route} (${vp.name}): React=${reactStats.h1Color} vs WP=${wpStats.h1Color}`);
      }
      if (reactStats.heroSubtitleColor !== wpStats.heroSubtitleColor) {
        throw new Error(`Hero subtitle color mismatch on ${route} (${vp.name}): React=${reactStats.heroSubtitleColor} vs WP=${wpStats.heroSubtitleColor}`);
      }
      if (Math.abs(reactStats.headerHeight - wpStats.headerHeight) > 2) {
        throw new Error(`Header height mismatch on ${route} (${vp.name}): React=${reactStats.headerHeight}px vs WP=${wpStats.headerHeight}px`);
      }
    }

    await reactCtx.close();
    await wpCtx.close();
  }

  // Interactive E2E verification on WordPress Theme (Desktop)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // 1. Hero Plan Your Trip modal launch & interactive Holiday Builder enquiry submission via WP REST
  await page.goto(`${WP_BASE}/`, { waitUntil: 'load', timeout: 20000 });
  await page.getByRole('button', { name: /Plan Your Trip/i }).first().click();
  const modal = page.locator('div.fixed.inset-0.z-50').first();
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForSelector('text=Plan Your', { timeout: 5000 });
  await page.screenshot({ path: path.join(shotDir, 'wp-holiday-builder-modal.png'), animations: 'disabled' });
  await modal.locator('input[type="text"]').first().fill('Priviledge Mukunga');
  await modal.locator('input[type="email"]').first().fill('priviledge.test@example.com');
  await modal.locator('input[type="tel"]').first().fill('+263 77 123 4567');
  await modal.locator('input[type="text"]').nth(1).fill('2 adults, 1 child, 4 nights, Sunset Cruise, Game Drive & Boma Dinner.');
  await modal.locator('form button[type="submit"]').first().click();
  await modal.locator('text=/OH-\\d{6,8}-/').first().waitFor({ state: 'visible', timeout: 8000 });
  const hbRef = await modal.locator('text=/OH-\\d{6,8}-/').first().textContent();
  if (!hbRef || !/OH-\d{6,8}-/.test(hbRef)) {
    throw new Error(`Holiday Builder enquiry confirmation missing OH reference: ${hbRef}`);
  }
  await page.keyboard.press('Escape');

  // 2. Accommodation search & Hotels category filter parity
  await page.goto(`${WP_BASE}/victoria-falls-accommodation`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('h1', { timeout: 5000 });
  const hotelBtn = page.getByRole('button', { name: /Hotels/i }).first();
  if (await hotelBtn.isVisible()) {
    await hotelBtn.click();
  }
  await page.screenshot({ path: path.join(shotDir, 'wp-accommodation-filtered.png') });

  // 3. Contact page submission against WP REST /wp-json/outbound/v1/enquiries
  await page.goto(`${WP_BASE}/contact`, { waitUntil: 'load', timeout: 20000 });
  const contactSection = page.locator('#contact-us');
  await contactSection.locator('input[type="email"]').first().fill('traveler@example.com');
  await contactSection.locator('input[type="text"]').first().fill('Tendai Moyo');
  await contactSection.locator('textarea').first().fill('Planning a 4-night Victoria Falls trip in September.');
  await contactSection.locator('input[type="checkbox"]').first().check();
  await contactSection.locator('form button[type="submit"]').first().click();
  await contactSection.locator('text=/OH-\\d{6,8}-/').first().waitFor({ timeout: 8000 });
  await page.screenshot({ path: path.join(shotDir, 'wp-contact-confirmed.png') });

  // 4. Newsletter signup against WP REST /wp-json/outbound/v1/newsletter
  await page.goto(`${WP_BASE}/`, { waitUntil: 'load', timeout: 20000 });
  const nlInput = page.locator('input[type="email"]').last();
  await nlInput.scrollIntoViewIfNeeded();
  await nlInput.fill('club@example.com');
  await nlInput.locator('xpath=ancestor::form[1]//input[@type="checkbox"]').check();
  await nlInput.locator('xpath=ancestor::form[1]//button[@type="submit"]').click();
  await page.waitForSelector('text=/Thank|confirm|saved/i', { timeout: 8000 });

  // 5. Outbound CMS Draft Preview E2E & Anonymous Draft Isolation
  await page.goto(`${WP_BASE}/?outbound_preview=1`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#root h1', { timeout: 10000 });
  const anonHasBanner = await page.locator('#outbound-draft-preview-banner').count();
  const anonH1 = (await page.locator('h1').first().textContent()) || '';
  if (anonHasBanner !== 0 || anonH1.includes('With Draft Preview')) {
    throw new Error('Anonymous ?outbound_preview=1 unexpectedly exposed Draft Preview Mode or draft headline.');
  }

  await page.goto(`${WP_BASE}/?outbound_preview=1&harness_cms_preview=1`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForSelector('#outbound-draft-preview-banner', { timeout: 10000 });
  const previewCheck = await page.evaluate(() => ({
    h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    hasGallery: Boolean(document.querySelector('#client-gallery')),
    vfBlueVar: getComputedStyle(document.documentElement).getPropertyValue('--vf-blue').trim().toUpperCase(),
  }));
  if (!previewCheck.h1.includes('With Draft Preview') || previewCheck.hasGallery || previewCheck.vfBlueVar !== '#1A5276') {
    throw new Error(`CMS Draft Preview verification failed: ${JSON.stringify(previewCheck)}`);
  }
  await page.screenshot({ path: path.join(shotDir, 'wp-cms-draft-preview.png'), fullPage: false });

  // 6. Dark Hero White Text Audit across ALL hero routes + simulated unlayered WP Global Styles injection
  for (const heroRoute of [
    '/',
    '/victoria-falls-accommodation',
    '/things-to-do-in-victoria-falls',
    '/victoria-falls-packages',
    '/blog',
    '/victoria-falls-guide',
    '/things-to-do/boma-dinner',
    '/things-to-do/bungee-jump',
  ]) {
    await page.goto(`${WP_BASE}${heroRoute}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForSelector('#root h1', { timeout: 10000 });
    await page.addStyleTag({
      content: 'body, p { color: #2f3a44; } h1, h2, h3, a { color: #0b5e8e; }',
    });
    const heroCheck = await page.evaluate(() => {
      const h1 = document.querySelector('#root h1');
      const darkHero = document.querySelector('#root .travel-hero, #root section[class*="bg-[#0D2833]"], #root header[class*="bg-[#0D2833]"]');
      const sub = darkHero ? darkHero.querySelector('.travel-hero-tagline, p') : null;
      return {
        h1Color: h1 ? getComputedStyle(h1).color : '',
        subColor: sub ? getComputedStyle(sub).color : '',
      };
    });
    if (heroCheck.h1Color !== 'rgb(255, 255, 255)') {
      throw new Error(`Dark hero H1 color must be rgb(255, 255, 255) on ${heroRoute} even under unlayered WP CSS, got ${heroCheck.h1Color}`);
    }
    if (heroCheck.subColor === 'rgb(47, 58, 68)' || heroCheck.subColor === 'rgb(11, 94, 142)') {
      throw new Error(`Dark hero subtitle color was overridden by unlayered WP CSS on ${heroRoute}: ${heroCheck.subColor}`);
    }
  }

  await ctx.close();

  fs.writeFileSync(path.join(shotDir, 'parity-metrics.json'), JSON.stringify(metricsReport, null, 2));

  if (wpConsoleErrors.length || wpPageErrors.length || wpFailedAssets.length) {
    console.error({ wpConsoleErrors, wpPageErrors, wpFailedAssets });
    process.exitCode = 1;
  } else {
    console.log(`SIDE-BY-SIDE VISUAL & FUNCTIONAL PARITY PASSED (${metricsReport.length} viewport/route pairs compared: 0 H1/header diffs, 0 broken images, 0 overflow, 0 WP console/network errors).`);
    console.log(`Screenshots saved to: ${shotDir}`);
  }
} finally {
  if (browser) await browser.close();
  phpServer.kill();
  reactServer.close();
}
