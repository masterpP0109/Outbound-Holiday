import { chromium } from '@playwright/test';
import fs from 'fs';

async function main() {
  const imgBase64 = fs.readFileSync('public/Experiences/Guided Tour of the Falls_/5-4.jpg').toString('base64');
  const dataUri = `data:image/jpeg;base64,${imgBase64}`;

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="m-0 p-0 bg-white">
        <!-- Responsive Hero that shows ALL of the falls -->
        <section class="w-full relative overflow-hidden bg-[#0B5E8E]">
          <!-- Desktop & Tablet: Tall cinematic view; Mobile: 16/10 landscape view preserving full breadth -->
          <div class="relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/11] lg:min-h-[75vh] lg:max-h-[82vh] flex flex-col justify-end text-white">
            <div class="absolute inset-0 z-0">
              <img
                src="${dataUri}"
                class="w-full h-full object-cover object-[center_60%] block"
              />
            </div>
            <!-- Gentle vignette overlay ensuring text legibility while keeping the entire falls vibrant -->
            <div class="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
            <div class="absolute inset-0 z-0 bg-gradient-to-l from-black/60 via-transparent to-transparent hidden sm:block"></div>
            
            <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-6 sm:pb-12 text-center sm:text-right flex flex-col items-center sm:items-end">
              <h1 class="font-serif font-bold text-white tracking-tight drop-shadow-md text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight">
                Victoria Falls Holidays
              </h1>
              <p class="text-sm xs:text-base sm:text-xl lg:text-2xl font-light text-white/95 mt-1 sm:mt-2 drop-shadow max-w-lg sm:ml-auto">
                Planned by locals, tailored to you.
              </p>
              <div class="mt-3 sm:mt-6 flex justify-center sm:justify-end">
                <button class="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-base px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-xl shadow-lg transition-transform">
                  Plan Your Trip
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Next section content preview -->
        <div class="p-8 bg-gray-50 text-center">
          <p class="text-gray-600 font-semibold">Trust Builders Section Follows Immediately</p>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'hero-perfect-desktop.png' });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'hero-perfect-mobile.png' });

  await browser.close();
  console.log('Screenshots generated');
}

main();
