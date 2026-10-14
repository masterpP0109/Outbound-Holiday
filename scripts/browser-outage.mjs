import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,timeout:20000,args:['--no-sandbox','--disable-gpu','--no-first-run']});
try{
 const page=await browser.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/content',route=>route.abort('failed'));
 // Dev pages have no prerendered snapshot, exercising a first visit during an outage.
 const base=process.env.OUTAGE_TEST_URL??'http://localhost:5173';
 for(const path of ['/', '/things-to-do-in-victoria-falls','/contact']){
  await page.goto(base+path);
  await page.locator('h1').first().waitFor();
  assert.ok(!/couldn.t load|page not found|loading outbound/i.test(await page.locator('h1').first().innerText()));
  assert.equal(await page.getByRole('button',{name:'Retry',exact:true}).count(),0);
 }
 assert.deepEqual(errors,[]);
 console.log('First visits and navigation render published content with the content API offline.');
}finally{await browser.close();}
