import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { installContent } from '../src/runtime/catalog';
import {
  INITIAL_BLOG_CATEGORIES,
  adaptWordPressPostToBlogPost,
  createBlogDataAdapter,
  formatBlogPostForNewsletter,
  getBlogCategories,
  getBlogPostBySlug,
  getPublishedBlogPosts,
  getRelatedBlogPosts,
} from '../src/data/blogData';
import type { WordPressRestPost } from '../src/types/blog';

const snapshot = JSON.parse(
  await readFile('src/runtime/published-content.json', 'utf8'),
);
installContent(snapshot);

test('loads all 7 initial data-driven categories with counts', () => {
  const categories = getBlogCategories();
  const names = categories.map((c) => c.name);
  for (const expected of INITIAL_BLOG_CATEGORIES) {
    assert.ok(names.includes(expected.name), `Missing category: ${expected.name}`);
  }
  assert.equal(categories.length, 7);
});

test('adapts existing guide articles into WordPress-compatible BlogPosts', () => {
  const posts = getPublishedBlogPosts();
  assert.equal(posts.length, 11);

  const bestTime = getBlogPostBySlug('best-time-to-visit');
  assert.ok(bestTime);
  assert.equal(bestTime.status, 'publish');
  assert.equal(bestTime.source, 'guide-adapter');
  assert.ok(bestTime.featuredImage.url);
  assert.ok(bestTime.featuredImage.alt);
  assert.ok(bestTime.author?.name);
  assert.ok(bestTime.categories.length > 0);
  assert.ok(bestTime.tags.length > 0);
  assert.ok(bestTime.seo.metaTitle.includes('Blog'));
  assert.ok(bestTime.seo.metaDescription);

  const related = getRelatedBlogPosts(bestTime, 3);
  assert.equal(related.length, 3);
  assert.ok(related.every((r) => r.slug !== bestTime.slug));
});

test('adapts native WordPress REST API posts and excludes non-published posts', () => {
  const wpPayload: WordPressRestPost[] = [
    {
      id: 401,
      slug: 'victoria-falls-peak-water-season',
      status: 'publish',
      date: '2026-04-10T09:00:00',
      date_gmt: '2026-04-10T07:00:00',
      modified: '2026-04-12T11:30:00',
      modified_gmt: '2026-04-12T09:30:00',
      title: { rendered: 'Victoria Falls Peak Water Season &amp; Tips' },
      excerpt: { rendered: '<p>What to expect during peak Zambezi flow.</p>' },
      content: { rendered: '<h2>Rainforest Spray Guide</h2><p>Bring waterproof gear.</p>' },
      acf: { reading_time: '4 min read', location: 'Victoria Falls' },
      yoast_head_json: {
        title: 'Peak Water Season Tips | Outbound Holidays',
        description: 'Plan your high-water Victoria Falls visit.',
      },
      _embedded: {
        author: [{ id: 2, name: 'Tariro Moyo' }],
        'wp:featuredmedia': [
          { source_url: '/Experiences/Guided Tour of the Falls_/5-4.jpg', alt_text: 'Rainforest mist over Victoria Falls' },
        ],
        'wp:term': [
          [{ id: 12, slug: 'travel-news', name: 'Travel News', taxonomy: 'category' }],
          [{ id: 34, slug: 'high-water', name: 'High Water', taxonomy: 'post_tag' }],
        ],
      },
    },
    {
      id: 402,
      slug: 'unpublished-draft-post',
      status: 'draft',
      date: '2026-04-11T09:00:00',
      modified: '2026-04-11T09:00:00',
      title: { rendered: 'Internal Draft' },
      excerpt: { rendered: '<p>Draft excerpt</p>' },
      content: { rendered: '<p>Draft content</p>' },
    },
  ];

  const adapted = wpPayload.map(adaptWordPressPostToBlogPost);
  const adapter = createBlogDataAdapter(adapted, 'wordpress-rest');
  const published = adapter.getPublishedPosts();

  assert.equal(published.length, 1);
  assert.equal(published[0].title, 'Victoria Falls Peak Water Season & Tips');
  assert.equal(published[0].excerpt, 'What to expect during peak Zambezi flow.');
  assert.equal(published[0].author?.name, 'Tariro Moyo');
  assert.equal(published[0].categories[0].slug, 'travel-news');
  assert.equal(published[0].tags[0].name, 'High Water');
  assert.equal(published[0].source, 'wordpress-rest');
  assert.equal(adapter.getPostBySlug('unpublished-draft-post'), undefined);

  const newsletter = formatBlogPostForNewsletter(published[0]);
  assert.equal(
    newsletter.url,
    'https://outbound-holiday.vercel.app/blog/victoria-falls-peak-water-season',
  );
  assert.equal(newsletter.category, 'Travel News');
});

