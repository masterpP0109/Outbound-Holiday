import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceImageUrls } from '../shared/cloud-images';
test('image migration preserves descriptions, prices, order and its input', () => {
  const source = { title: 'Victoria Falls', price: 100, image: '/old.jpg', gallery: ['/old.jpg', '/other.jpg'], details: { alt: 'A waterfall', description: 'See /old.jpg on the trip.' } };
  const result = replaceImageUrls(source, { '/old.jpg': 'https://example.test/new.webp' });
  assert.deepEqual(result, { ...source, image: 'https://example.test/new.webp', gallery: ['https://example.test/new.webp', '/other.jpg'] });
  assert.equal(source.image, '/old.jpg');
  assert.deepEqual(replaceImageUrls(result, { '/old.jpg': 'https://example.test/new.webp' }), result);
});
