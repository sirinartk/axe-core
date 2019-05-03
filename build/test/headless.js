const getTestFiles = require('./headless/get-test-files');
const runner = require('./headless/runner');
// limit concurrency to prevent host spike
const limit = require('p-limit')(5);

const init = async () => {
	console.time(`Headless tests duration`);

	process.setMaxListeners(Infinity);

	const urls = await getTestFiles();
	try {
		await Promise.all(urls.map(url => limit(() => runner({ url }))));
	} catch (error) {
		console.error(error);
	}

	console.timeEnd(`Headless tests duration`);
};

init();
