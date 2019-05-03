/*global window*/
const puppeteer = require('puppeteer');
const consoleToStdOut = require('./console-to-stdout');
const setGlobals = require('./set-globals');

const runner = async options => {
	return new Promise(async (resolve, reject) => {
		const { url, reporter = 'Spec' } = options;
		if (!url) {
			Promise.reject(`url to test should be specified.`);
		}

		const puppeteerOptions = {
			headless: true,
			args: ['--no-sandbox', '-–disable-setuid-sandbox'],
			ignoreHTTPSErrors: true
		};
		const browser = await puppeteer.launch(puppeteerOptions);
		const [page] = await browser.pages();

		page.on('console', consoleToStdOut);
		page.on('pageerror', err => reject(err));

		await page.evaluateOnNewDocument(setGlobals, reporter);
		await page.goto(url, { waitUntil: 'load' });
		await page.waitForFunction(() => window.__mochaResult__, {
			timeout: 300000
		});

		const { result } = await page.evaluate(() => window.__mochaResult__);
		const { stats } = result;
		// Print failures, if any
		if (stats.failures > 0) {
			console.log(`Failures: ${stats.failures}\n`);
			console.log(`url: ${options.url}\n`);
			result.failures.forEach(test => {
				console.log(JSON.stringify(test, undefined, 2));
			});
		}
		browser.close();
		resolve();
	});
};

module.exports = runner;
