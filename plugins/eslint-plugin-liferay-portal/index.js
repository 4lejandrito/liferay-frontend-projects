/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'no-explicit-extend': require('./lib/rules/no-explicit-extend'),
		'no-global-fetch': require('./lib/rules/no-global-fetch'),
		'no-loader-import-specifier': require('./lib/rules/no-loader-import-specifier'),
		'no-metal-plugins': require('./lib/rules/no-metal-plugins'),
		'no-react-dom-render': require('./lib/rules/no-react-dom-render'),
		'no-side-navigation': require('./lib/rules/no-side-navigation'),
	},
};
