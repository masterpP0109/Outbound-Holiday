import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PAGE_ROUTES,SITE_URL,resolveRoute } from '../src/routes';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PackagesDirectoryPage } from '../src/components/travel/PackagesDirectoryPage';
import { ALL_PACKAGES } from '../src/data/packagesData';

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const titles = new Set<string>();
for (const route of PAGE_ROUTES) {
  const file = route.path === '/' ? 'dist/index.html' : join('dist', `${route.path.slice(1)}.html`);
  const html = await readFile(file, 'utf8');
  assert.match(html, /<h1\b/, `${route.path} must have a main heading before JavaScript runs`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `${route.path} must have a description`);
  assert.ok(html.includes(`rel="canonical" href="${SITE_URL}${route.path}"`), `${route.path} must have its own canonical URL`);
  assert.ok(sitemap.includes(`<loc>${SITE_URL}${route.path}</loc>`), `${route.path} must appear in the sitemap`);
  assert.equal(resolveRoute(route.path + (route.path === '/' ? '' : '/')).path, route.path);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${route.path} must have a unique title`);
  titles.add(title!);
  for (const match of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)[^"]*"/g)) {
    assert.notEqual(resolveRoute(match[1]).view, 'not-found', `${route.path} links to an unknown page: ${match[1]}`);
  }
}
assert.equal(resolveRoute('/things-to-do/does-not-exist').view, 'not-found');
assert.equal(resolveRoute('/accommodation/does-not-exist').view, 'not-found');
assert.equal(resolveRoute('/packages/does-not-exist').view, 'not-found');
const notFound = await readFile('dist/404.html', 'utf8');
assert.ok(notFound.includes('noindex, follow'));
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`${SITE_URL}/sitemap.xml`));

// A query supplied by the header must actually change the package results.
const searchHtml = (searchQuery: string) => renderToString(React.createElement(PackagesDirectoryPage, {
  currency: 'USD', searchQuery, setSearchQuery: () => {}, onSelectPackage: () => {}, onNavigateHome: () => {},
}));
const resultPaths = (html: string) => [...html.matchAll(/href="(\/packages\/[^"#?]+)"/g)].map((match) => match[1]);
assert.equal(resultPaths(searchHtml('')).length, ALL_PACKAGES.length);
assert.equal(resultPaths(searchHtml('no-matching-package-123456')).length, 0);
const titleQuery = ALL_PACKAGES[0].title;
assert.ok(resultPaths(searchHtml(titleQuery.toUpperCase())).includes(`/packages/${ALL_PACKAGES[0].slug}`));
console.log(`SEO checks passed for ${PAGE_ROUTES.length} pages: content, headings, unique titles, descriptions, canonical URLs, links, sitemap and 404.`);
console.log('Package search checks passed: all results, no results and case-insensitive title matching.');
