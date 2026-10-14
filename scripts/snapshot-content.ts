import { writeFile } from 'node:fs/promises';
import { loadPublishedContent } from './load-content';

// Ship validated published content with the frontend so first visits survive API outages.
const content = await loadPublishedContent();
await writeFile('src/runtime/published-content.json', JSON.stringify(content));
console.log('Saved published holiday content snapshot.');
