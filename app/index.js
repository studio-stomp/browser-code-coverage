const minimist = require('minimist')
const puppeteer = require('puppeteer')
const pti = require('puppeteer-to-istanbul')
const fs = require('fs')
const { exec } = require('child_process')

const OUTPUT_PATH = __dirname + '/output/'

// @todo: probably a bit heavy with all the CBs
const profiles = {
    "Laptop HiDPI": async (page) => {
        await page.setViewport({
            width: 1440,
            height: 900
        });
    },
    "iPad": async (page) => {
        await page.emulate(puppeteer.devices['iPad'])
    },
    "iPad landscape": async (page) => {
        await page.emulate(puppeteer.devices['iPad landscape'])
    },
    "iPhone X": async (page) => {
        await page.emulate(puppeteer.devices['iPhone X'])
    },
    "iPhone X landscape": async (page) => {
        await page.emulate(puppeteer.devices['iPhone X landscape'])
    },
    "Nexus 5X": async (page) => {
        await page.emulate(puppeteer.devices['Nexus 5X'])
    },
    "Nexus 5X landscape": async (page) => {
        await page.emulate(puppeteer.devices['Nexus 5X landscape'])
    },
}

//Scroll to end of the page
const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const run = async (domain) => {
    // @todo: no sandbox is a Docker specific thing? Error: [1226/123430.500421:ERROR:zygote_host_impl_linux.cc(90)] Running as root without --no-sandbox is not supported. See https://crbug.com/638180.
    const browser = await puppeteer.launch({headless: true, ignoreHTTPSErrors: true, args: ['--no-sandbox']})
    const page = await browser.newPage()
    await page.setCacheEnabled(false);

    const url = `https://${domain}`

    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);

    for (const profile in profiles) {
        // Setup profile
        await profiles[profile](page)

        // Navigate to page
        await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000});
        await autoScroll(page);
    }

    // Disable both JavaScript and CSS coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);

    console.log('pti.write')
    pti.write(
      [...jsCoverage, ...cssCoverage],
      {
          includeHostname: true,
          storagePath: OUTPUT_PATH + domain + '/.nyc_output'
      }
    )

    console.log('exec')
    // Take the coverage output and create a HTML report
    exec(
      `${__dirname}/node_modules/.bin/nyc report --reporter=html --temp-dir=${OUTPUT_PATH + domain + '/.nyc_output'} --report-dir=${OUTPUT_PATH + domain + '/coverage'}`,
      (error, stdout, stderr) => {
          if (error) {
              console.error(`error: ${error.message}`);
              return;
          }

          if (stderr) {
              console.error(`stderr: ${stderr}`);
              return;
          }

          console.log(`stdout:\n${stdout}`);
      }
    );

    await browser.close()
}

// Start
const checkDomain = async (domain) => {

    // Remove any previous results
    await fs.promises.rmdir(OUTPUT_PATH + domain, { recursive: true })

    // Generate output directory
    await fs.promises.mkdir(OUTPUT_PATH + domain, {recursive: true})

    // @todo: find all links and follow? How many levels? Prevent endless loops? Change to use only provided urls? (last one is actually more consistent and faster as amount of urls will be smaller scope. However, this approach would need to be manually updated, urls would not be discovered)
    await run(domain)
}

const start = async () => {
    const argv = minimist(process.argv.slice(2));

    if (0 === argv._.length) {
        // No domains provided
        return 1
    }

    for (const domain of argv._) {
        checkDomain(domain).then(() => console.log(`processed ${domain}`))
    }
}

start()
