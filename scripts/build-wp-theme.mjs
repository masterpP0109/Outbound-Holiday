/**
 * Build standalone Outbound Holidays WordPress Theme assets:
 * 1. Sync `src/runtime/published-content.json` -> `wordpress-theme/outbound-holidays/inc/default-snapshot.json`
 * 2. Compile the exact approved React frontend + Tailwind CSS (`wordpress-theme/app-src/wp-main.tsx`)
 *    into self-contained theme bundles:
 *      - `wordpress-theme/outbound-holidays/assets/app/outbound-app.js` (IIFE, zero external chunk requests)
 *      - `wordpress-theme/outbound-holidays/assets/app/outbound-app.css`
 * 3. Package installable `wordpress-theme/outbound-holidays.zip` under standard WordPress upload limits (< 2 MB).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const themeDir = path.join(rootDir, 'wordpress-theme', 'outbound-holidays');
const appSrcEntry = path.join(rootDir, 'wordpress-theme', 'app-src', 'wp-main.tsx');
const outAppDir = path.join(themeDir, 'assets', 'app');
const outCssPath = path.join(outAppDir, 'outbound-app.css');
const outJsPath = path.join(outAppDir, 'outbound-app.js');
const outZipPath = path.join(rootDir, 'wordpress-theme', 'outbound-holidays.zip');
const tmpViteOut = path.join(rootDir, '.tmp-wp-theme-build');

fs.mkdirSync(outAppDir, { recursive: true });

// Step 1: Sync baseline snapshot JSON into theme inc/
const srcSnapshot = path.join(rootDir, 'src', 'runtime', 'published-content.json');
const dstSnapshot = path.join(themeDir, 'inc', 'default-snapshot.json');
fs.copyFileSync(srcSnapshot, dstSnapshot);

// Remove legacy split assets superseded by outbound-app.js / outbound-app.css
for (const legacyFile of [
  path.join(themeDir, 'assets', 'css', 'outbound-theme.css'),
  path.join(themeDir, 'assets', 'js', 'holiday-builder.bundle.js'),
  path.join(themeDir, 'assets', 'js', 'theme-ui.js'),
]) {
  if (fs.existsSync(legacyFile)) {
    fs.unlinkSync(legacyFile);
  }
}

// Step 2: Compile exact approved React application + Tailwind v4 CSS cleanly via Vite (single IIFE bundle)
console.log('Building WordPress theme React + Tailwind bundle from wordpress-theme/app-src/wp-main.tsx...');
await build({
  root: rootDir,
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  resolve: {
    alias: {
      '@': rootDir,
    },
  },
  build: {
    outDir: tmpViteOut,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 8192,
    rollupOptions: {
      input: appSrcEntry,
      output: {
        format: 'iife',
        name: 'OutboundHolidaysApp',
        inlineDynamicImports: true,
        entryFileNames: 'outbound-app.js',
        assetFileNames: (assetInfo) => {
          if ((assetInfo.name || '').endsWith('.css')) return 'outbound-app.css';
          return '[name][extname]';
        },
      },
    },
  },
});

const builtCss = path.join(tmpViteOut, 'outbound-app.css');
const builtJs = path.join(tmpViteOut, 'outbound-app.js');

if (!fs.existsSync(builtCss) || !fs.existsSync(builtJs)) {
  throw new Error('Vite WordPress theme app build failed to emit outbound-app.css or outbound-app.js.');
}

fs.copyFileSync(builtCss, outCssPath);
fs.copyFileSync(builtJs, outJsPath);
fs.rmSync(tmpViteOut, { recursive: true, force: true });

console.log(`Generated: ${path.relative(rootDir, outCssPath)} (${Math.round(fs.statSync(outCssPath).size / 1024)} KB)`);
console.log(`Generated: ${path.relative(rootDir, outJsPath)} (${Math.round(fs.statSync(outJsPath).size / 1024)} KB)`);

// Step 3: Create standard installable WordPress theme ZIP archive
if (fs.existsSync(outZipPath)) {
  fs.unlinkSync(outZipPath);
}

if (process.platform === 'win32') {
  const psScript = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$src = (Resolve-Path '${themeDir}').Path
$dst = '${outZipPath}'
if (Test-Path $dst) { Remove-Item $dst -Force }
$fs = [System.IO.File]::Open($dst, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem -Path $src -Recurse -File | ForEach-Object {
  $rel = 'outbound-holidays/' + $_.FullName.Substring($src.Length + 1).Replace('\\', '/')
  $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
  $es = $entry.Open()
  $inFs = [System.IO.File]::Open($_.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  $inFs.CopyTo($es)
  $inFs.Close()
  $es.Close()
}
$zip.Dispose()
$fs.Dispose()
`;
  execFileSync('powershell.exe', ['-NoProfile', '-Command', psScript], { stdio: 'inherit' });
} else {
  execFileSync('zip', ['-r', outZipPath, 'outbound-holidays'], {
    cwd: path.join(rootDir, 'wordpress-theme'),
    stdio: 'inherit',
  });
}

const zipSize = fs.statSync(outZipPath).size;
if (zipSize < 100000) {
  throw new Error(`ZIP archive too small (${zipSize} bytes) — packaging failed.`);
}
const zipKb = Math.round(zipSize / 1024);
console.log(`Packaged installable theme archive: ${path.relative(rootDir, outZipPath)} (${zipKb} KB / ${(zipSize / (1024 * 1024)).toFixed(2)} MB)`);
if (zipSize > 2 * 1024 * 1024) {
  console.warn(`WARNING: ZIP archive is ${(zipSize / (1024 * 1024)).toFixed(2)} MB (> 2.00 MB default PHP upload_max_filesize).`);
}
