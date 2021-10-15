/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {FilePath} = require('@liferay/js-toolkit-core');
const escapeStringRegexp = require('escape-string-regexp');
const globby = require('globby');
const project = require('liferay-npm-build-tools-common/lib/project');

const replaceTokens = require('../util/replaceTokens');

/**
 * A loader to rewrite static asset URLs inside a file (usually a webpack
 * generated bundle).
 *
 * This loader prepends the configured web context path to the static asset URLs
 * so that they can be retrieved from a Liferay server.
 *
 * The web context path is taken from property
 * [create-jar.features.web-context](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs/.npmbundlerrc-file-reference.md#create-jarfeaturesweb-context).
 * inside `.npmbundlerrc`.
 *
 * Valid options are:
 *
 *   - docroot: project relative path of directory containing assets
 *   - include: list of regexps to match assets that need their URL to be processed
 *   - matchSubstring: whether to look for the whole URL inside the string or just a part
 */
module.exports = function adaptStaticURLsAtRuntime(context, options) {
	const {content, log} = context;
	const {docroot, include, matchSubstring = false} = replaceTokens(
		project.default,
		options
	);

	const docrootDir = project.default.dir.join(
		new FilePath(docroot, {posix: true}).asNative
	);

	const filePosixPaths = globby
		.sync(`${docrootDir.asPosix}/**`, {
			absolute: true,
			followSymbolicLinks: false,
			onlyFiles: true,
		})
		.map((filePath) => docrootDir.relative(filePath).asPosix);

	const patterns = Array.isArray(include)
		? include.map((item) => new RegExp(item))
		: [new RegExp(include)];

	let modifiedContent = content;

	const matchPrefix = matchSubstring ? '[^"]*' : '';

	filePosixPaths.forEach((filePosixPath) => {
		if (!patterns.some((pattern) => pattern.test(filePosixPath))) {
			return;
		}

		const regexp = new RegExp(
			`"${matchPrefix}${escapeStringRegexp(filePosixPath)}"`,
			'g'
		);

		const matches = regexp.exec(content);

		if (!matches) {
			return;
		}

		log.info(
			'adapt-static-urls',
			`Adapted ${matches.length} occurrences of URL '${filePosixPath}'`
		);

		modifiedContent = modifiedContent.replace(
			regexp,
			`_ADAPT_RT_.adaptStaticURL("${filePosixPath}")`
		);
	});

	return modifiedContent;
};
