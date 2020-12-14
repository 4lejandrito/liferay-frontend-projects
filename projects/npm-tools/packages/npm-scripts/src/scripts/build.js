/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const buildSass = require('../sass/build');
const getMergedConfig = require('../utils/getMergedConfig');
const minify = require('../utils/minify');
const runBabel = require('../utils/runBabel');
const runBundler = require('../utils/runBundler');
const setEnv = require('../utils/setEnv');
const {buildSoy, cleanSoy, soyExists, translateSoy} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');
const validateConfig = require('../utils/validateConfig');
const webpack = require('./webpack');

const {build: BUILD_CONFIG, federation: FEDERATION_CONFIG} = getMergedConfig(
	'npmscripts'
);
const CWD = process.cwd();

if (!BUILD_CONFIG) {
	throw new Error('npmscripts.config.js is missing required "build" key');
}

///
// Runs the `liferay-npm-bridge-generator` executable and removes sourcemaps to
// ensure `liferay-npm-scripts build` is idempotent.
//
// In our common workflow right now, runBundler and runBridge can interact to
// create some kind of circular dependency where files keep being re-processed
// over and over or are only processed after the first pass.
//
// Given a typical config, where the bundler is configured to write output to
// "build/..." and the bridge generator is configured to read from "build/..."
// and write to "build/.../bridge":
//
// 1st pass
// - runBundler: operates on output folder (eg. "build/...")
// - runBridge: will expand output with an additional `bridge` folder (eg. "build/.../bridge")
//
// 2nd pass
// - runBundler: will now see `bridge` folder to process, generating sourcemaps
// - runBridge: depending on the configuration it can re-process previous `bridge`
// 				folders, so it's advised to always add `!**/bridge` inside the
//				`.npmbridgerc` `file-globs` configuration.
//
// To ensure output is the same after 1st and 2nd pass, we need to cleanup rogue
// sourcemaps in the bridge-generator output folder.
//
// See https://github.com/petershin/liferay-portal/pull/724 for more details.
//

function runBridge() {
	spawnSync('liferay-npm-bridge-generator');

	// Retrieves the `.npmbridgerc` configuration which we already know exists

	const bridgeConfig = JSON.parse(fs.readFileSync('.npmbridgerc', 'utf8'));

	Object.keys(bridgeConfig).forEach((moduleKey) => {
		const output = bridgeConfig[moduleKey].output;

		if (output) {
			rimraf.sync(`${output}/**/*.map`);
		}
	});
}

// Utility for getting paths to @clayui/css variables
// This shouldn't ever fail, but is necessary so that we don't require
// '@clayui/css' as a dependency in this package.

const getClayPaths = () => {
	try {
		return require('@clayui/css').includePaths;
	}
	catch (e) {
		return [];
	}
};

/**
 * Main script that runs all all specified build tasks synchronously.
 *
 * Babel and liferay-npm-bundler are run unless the disable flag is set,
 * liferay-npm-bridge-generator and webpack are run if the corresponding
 * ".npmbridgerc" and "webpack.config.js" files, respectively, are
 * present, and soy is run when soy files are detected.
 * `minify()` is run unless `NODE_ENV` is `development`.
 */
module.exports = async function (...args) {
	setEnv('production');

	validateConfig(
		BUILD_CONFIG,
		['input', 'output', 'dependencies', 'temp'],
		'liferay-npm-scripts: `build`'
	);

	const useSoy = soyExists();

	if (useSoy) {
		buildSoy();
	}

	const disableOldBuild =
		FEDERATION_CONFIG && FEDERATION_CONFIG.disableOldBuild;

	if (!disableOldBuild) {
		runBabel(
			BUILD_CONFIG.input,
			'--out-dir',
			BUILD_CONFIG.output,
			'--source-maps'
		);
	}

	if (fs.existsSync('webpack.config.js') || FEDERATION_CONFIG) {
		webpack(...args);
	}

	if (!disableOldBuild) {
		runBundler();
	}
	else {
		const {output} = BUILD_CONFIG;

		fs.copyFileSync('package.json', path.join(output, 'package.json'));
		fs.writeFileSync(path.join(output, 'manifest.json'), '{}');
	}

	translateSoy(BUILD_CONFIG.output);

	if (fs.existsSync(path.join(CWD, '.npmbridgerc'))) {
		runBridge();
	}

	if (useSoy) {
		cleanSoy();
	}

	if (!BUILD_CONFIG.disableSass) {
		buildSass(path.join(CWD, BUILD_CONFIG.input), {
			imports: [
				...getClayPaths(),
				path.dirname(require.resolve('bourbon')),
			],
			outputDir: BUILD_CONFIG.output,
		});
	}

	if (process.env.NODE_ENV !== 'development') {
		await minify();
	}
};
