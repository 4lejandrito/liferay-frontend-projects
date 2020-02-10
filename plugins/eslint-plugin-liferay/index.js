/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'array-is-array': require('./lib/rules/array-is-array'),
		'destructure-requires': require('./lib/rules/destructure-requires'),
		'group-imports': require('./lib/rules/group-imports'),
		'import-extensions': require('./lib/rules/import-extensions'),
		'imports-first': require('./lib/rules/imports-first'),
		'no-absolute-import': require('./lib/rules/no-absolute-import'),
		'no-duplicate-class-names': require('./lib/rules/no-duplicate-class-names'),
		'no-duplicate-imports': require('./lib/rules/no-duplicate-imports'),
		'no-dynamic-require': require('./lib/rules/no-dynamic-require'),
		'no-it-should': require('./lib/rules/no-it-should'),
		'no-require-and-call': require('./lib/rules/no-require-and-call'),
		'padded-test-blocks': require('./lib/rules/padded-test-blocks'),
		'sort-class-names': require('./lib/rules/sort-class-names'),
		'sort-import-destructures': require('./lib/rules/sort-import-destructures'),
		'sort-imports': require('./lib/rules/sort-imports'),
		'trim-class-names': require('./lib/rules/trim-class-names'),
	},
};
