/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Remove a webpack hash (a hex number surrounded by dots near the end of the
 * file name) if present from a file path.
 */
module.exports = function removeWebpackHash(filePath) {
	const filePathParts = filePath.split('.');

	let hashIndex;

	for (hashIndex = filePathParts.length - 1; hashIndex >= 0; hashIndex--) {
		const filePathPart = filePathParts[hashIndex];

		if (filePathPart.match(/^[0-9a-fA-F]+$/)) {
			break;
		}
	}

	if (hashIndex == -1) {
		return filePath;
	}

	filePathParts.splice(hashIndex, 1);

	return filePathParts.join('.');
};
