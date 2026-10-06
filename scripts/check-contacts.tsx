import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ts from 'typescript';
import App from '../src/App';
import { PAGE_ROUTES } from '../src/routes';
import { WHATSAPP_NUMBER, PHONE_URL, getWhatsAppUrl, getWhatsAppEnquiryUrl, getWhatsAppSpecialistUrl } from '../src/utils/whatsapp';
import { HolidayBuilderModal } from '../src/components/travel/HolidayBuilderModal';
import { MeetYourGuide } from '../src/components/travel/MeetYourGuide';
import { GuideHubView } from '../src/components/travel/guide/GuideHubView';
import { MobileStickyCta } from '../src/components/common/MobileStickyCta';

const noop = () => {};
const message = "Rudo & Tawanda + family #1, 50% 🐘\nDates: 1–4 December";
assert.equal(new URL(getWhatsAppUrl(message)).searchParams.get('text'), message);
for (const href of [getWhatsAppEnquiryUrl(message), getWhatsAppSpecialistUrl()]) assert.equal(new URL(href).pathname, `/${WHATSAPP_NUMBER}`);
assert.equal(PHONE_URL, `tel:+${WHATSAPP_NUMBER}`);

let checkedLinks = 0;
function checkMarkup(html: string) {
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'");
    if (href.startsWith('https://wa.me/')) {
      const url = new URL(href);
      assert.equal(url.pathname, `/${WHATSAPP_NUMBER}`);
      assert.ok(url.searchParams.get('text'));
      assert.equal([...url.searchParams.keys()].join(','), 'text');
      checkedLinks++;
    } else if (href.startsWith('tel:')) {
      assert.equal(href, PHONE_URL);
      checkedLinks++;
    }
  }
}
for (const route of PAGE_ROUTES) checkMarkup(renderToString(<App initialPath={route.path} />));
checkMarkup(renderToString(<HolidayBuilderModal isOpen onClose={noop} />));
checkMarkup(renderToString(<MeetYourGuide onOpenConsultation={noop} />));
checkMarkup(renderToString(<GuideHubView onSelectArticle={noop} onOpenPlanHoliday={noop} onNavigateHome={noop} />));
checkMarkup(renderToString(<MobileStickyCta onOpenPlanHoliday={noop} experienceName={message} />));

// Exercise the actual builder message code, including reserved URL characters.
const builderSource = await readFile('src/components/travel/HolidayBuilderModal.tsx', 'utf8');
const sourceFile = ts.createSourceFile('builder.tsx', builderSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let builderBody = '';
function findBuilder(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(sourceFile) === 'buildWhatsAppLink' && node.initializer && ts.isArrowFunction(node.initializer)) builderBody = node.initializer.body.getText(sourceFile);
  ts.forEachChild(node, findBuilder);
}
findBuilder(sourceFile);
assert.ok(builderBody);
const buildLink = new Function('getWhatsAppUrl', 'selectedActivitiesList', 'selectedStayTierObj', 'adultsCount', 'kidsCount', 'partyType', 'nightsCount', 'estimatedMinUSD', 'estimatedMaxUSD', 'travelSeason', 'fullName', builderBody);
const builderUrl = new URL(buildLink(getWhatsAppUrl, [{ title: 'Cruise & Safari' }], { name: 'Comfort' }, 2, 1, 'family', 3, 1000, 1180, 'December', message));
assert.equal(builderUrl.pathname, `/${WHATSAPP_NUMBER}`);
assert.equal([...builderUrl.searchParams.keys()].join(','), 'text');
assert.ok(builderUrl.searchParams.get('text')?.includes(message));
assert.ok(builderUrl.searchParams.get('text')?.includes('Cruise & Safari'));
assert.ok(builderUrl.searchParams.get('text')?.includes('\n\n'));
assert.ok(!builderUrl.searchParams.get('text')?.includes('%0A'));

async function checkSource(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkSource(path);
    else if (entry.name.endsWith('.tsx')) {
      const source = await readFile(path, 'utf8');
      assert.ok(!/263771234567|263714701721|https:\/\/wa\.me\/|tel:\+263/.test(source), `${path} must use centralized contact details`);
      assert.ok(!/Furqal|furqal|\bFK\b/.test(source), `${path} must not contain the placeholder identity`);
    }
  }
}
await checkSource('src/components');
console.log(`Contact checks passed: ${checkedLinks} rendered contact links, centralized references and Holiday Builder message encoding.`);
