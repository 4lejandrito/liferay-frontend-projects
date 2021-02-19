/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

function addNamespace(packageName, namespacingPackageName) {
	const namespace = makeNamespace(namespacingPackageName);

	if (packageName.indexOf('@') === 0) {
		return `@${namespace}$${packageName.substring(1)}`;
	}
	else {
		return `${namespace}$${packageName}`;
	}
}

function makeNamespace(namespacingPackageName) {
	let namespace = namespacingPackageName;

	if (namespace.startsWith('@')) {
		namespace = namespace.substring(1).replace('/', '!');
	}

	return namespace;
}

module.exports = {
	addNamespace,
	makeNamespace,
};
