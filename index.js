const path = require("path");
const puppeteer = require("puppeteer-core");
const whichChrome = require("which-chrome");
const downloadFolderPath = require("downloads-folder")();
const { format } = require("date-fns");

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function screenshot(options) {
  const chromePath = whichChrome.Chrome || whichChrome.Chromium;
  const url = options.url;
  const delay = options.delay || 0;

  if (!chromePath) {
    throw new Error(`No Chrome installation found - used path ${chromePath}`);
  }

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    executablePath: chromePath,
    headless: process.env.NODE_ENV === "dev" ? false : true,
    defaultViewport: null
  });
  const page = await browser.newPage();
  await page.goto(url);

  const { width, height } = await page.evaluate(() => {
    return {
      width: document.body.offsetWidth,
      height: document.body.scrollHeight
    };
  });

  await sleep(delay);

  const dateLayout = "YYYY-MM-DD_HH.mm.ss";
  const timestamp = format(new Date(), dateLayout);

  const imagePath = path.join(
    downloadFolderPath,
    `Screenshot_${timestamp}.png`
  );

  await page.screenshot({
    path: imagePath,
    clip: {
      x: 0,
      y: 0,
      width,
      height
    }
  });

  console.log(`Screenshot have been downloaded at "${imagePath}"`);
}

module.exports = screenshot;
