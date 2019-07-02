/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const prettier = require('prettier');
const expandGlobs = require('../utils/expandGlobs');
const filterGlobs = require('../utils/filterGlobs');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const preprocessGlob = require('../utils/preprocessGlob');
const readIgnoreFile = require('../utils/readIgnoreFile');
const {SpawnError} = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	check: false
};

/**
 * File extensions that we want Prettier to process.
 */
const EXTENSIONS = ['.js', '.scss'];

/**
 * Prettier wrapper.
 */
function format(options = {}) {
	const {check} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const unfilteredGlobs = check
		? getMergedConfig('npmscripts', 'check')
		: getMergedConfig('npmscripts', 'fix');

	const globs = filterGlobs(unfilteredGlobs, ...EXTENSIONS);

	if (!globs.length) {
		const extensions = EXTENSIONS.join(', ');

		log(
			`No globs applicable to ${extensions} files specified: globs can be configured via npmscripts.config.js`
		);

		return;
	}

	// TODO: only exists at top level; refactor to share logic with
	// .eslintignore handling.
	const ignores = readIgnoreFile('.prettierignore');

	// Match Prettier behavior and ignore node_modules by default.
	if (ignores.indexOf('node_modules/**') === -1) {
		ignores.unshift('node_modules/**');
	}

	// Turn "{src,test}/*" into ["src/*", "test/*"]:
	const preprocessedGlobs = [];

	globs.forEach(glob => preprocessedGlobs.push(...preprocessGlob(glob)));

	const paths = expandGlobs(preprocessedGlobs, ignores);

	const config = getMergedConfig('prettier');

	let checked = 0;
	let bad = 0;
	let fixed = 0;

	paths.forEach(filepath => {
		checked++;

		try {
			// TODO: don't re-read file, run eslint on it too
			const source = fs.readFileSync(filepath).toString();

			const prettierOptions = {
				...config,
				filepath
			};

			if (!prettier.check(source, prettierOptions)) {
				if (check) {
					log(`${filepath}: BAD`);
					bad++;
				} else {
					fs.writeFileSync(
						filepath,
						prettier.format(source, prettierOptions)
					);
					fixed++;
				}
			}
		} catch (error) {
			// Generally this means a syntax error.
			log(`${filepath}: ${error}`);
			bad++;
		}
	});

	const files = count => (count === 1 ? 'file' : 'files');

	const summary = [
		`Prettier checked ${checked} ${files(checked)}`,
		`found ${bad} ${files(bad)} with problems`
	];

	if (fixed) {
		summary.push(`fixed ${fixed} ${files(fixed)}`);
	}

	if (bad) {
		throw new SpawnError(summary.join(', '));
	} else {
		log(summary.join(', '));
	}
}

module.exports = format;
