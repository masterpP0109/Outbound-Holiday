# Page URLs and static HTML

Navigation uses real links and the History API. A shared route registry in `src/routes.ts` resolves direct visits, navigation, and browser back/forward actions.

Main pages:

- `/victoria-falls-guide`
- `/things-to-do-in-victoria-falls`
- `/victoria-falls-accommodation`
- `/victoria-falls-packages`
- `/client-gallery`

Activity, package, accommodation, and activity category pages have individual URLs derived from their data. Unknown URLs show a page-not-found view.

`npm run build` builds the browser app and prerenders every registered page to HTML with its own title, description, canonical URL, and content. It also writes `sitemap.xml`, `robots.txt`, and `404.html`. Vercel's `cleanUrls` setting serves the HTML files at extension-free URLs; no catch-all rewrite is needed. New detail pages in the data are included automatically on the next build. Keep slugs stable to preserve existing links.

Run `npm run lint` and, after building, `npm run check:seo`. The SEO check verifies rendered headings, metadata, links, the sitemap, unknown routes, and package search filtering.

The canonical origin is `SITE_URL` in `src/routes.ts`, currently `https://outbound-holiday.vercel.app`. Update it when moving to a custom domain. After deployment, submit `/sitemap.xml` in Google Search Console and inspect representative URLs. Deployment and Google indexing are separate steps; these code changes do not guarantee indexing.
