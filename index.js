/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');

const config = {
	env: {
		es6: true,
	},
	extends: ['eslint:recommended', require.resolve('eslint-config-prettier')],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	plugins: ['liferayportal', 'no-only-tests', 'notice'],
	rules: {
		'liferayportal/arrowfunction-newline': 'off',
		'no-only-tests/no-only-tests': 'error',
		'no-unused-expressions': 'error',
	},
};

if (fs.existsSync('copyright.js')) {
	config.rules['notice/notice'] = [
		'error',
		{
			templateFile: 'copyright.js',
		},
	];
}

module.exports = config;
