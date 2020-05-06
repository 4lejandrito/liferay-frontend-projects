/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import {
	SourceCode,
	SourceTransform,
	replace,
} from 'liferay-npm-build-tools-common/lib/transform/js';
import {parseAsExpressionStatement} from 'liferay-npm-build-tools-common/lib/transform/js/parse';

import {findFiles} from '../../../../../util/files';
import {removeWebpackHash} from '../../../../../util/webpack';

export default function adaptStaticURLsAtRuntime(
	...assetsGlobs: string[]
): SourceTransform {
	return (source =>
		_adaptStaticURLsAtRuntime(source, assetsGlobs)) as SourceTransform;
}

async function _adaptStaticURLsAtRuntime(
	source: SourceCode,
	assetsGlobs: string[]
): Promise<SourceCode> {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const assetURLsMap = findFiles(adaptBuildDir, assetsGlobs).reduce(
		(map, sourceAsset) => {
			map[sourceAsset.asPosix] = removeWebpackHash(sourceAsset).asPosix;

			return map;
		},
		{}
	);

	return await replace(source, {
		enter(node) {
			if (node.type !== 'Literal') {
				return;
			}

			const {value} = node;

			if (typeof value !== 'string') {
				return;
			}

			if (!assetURLsMap[value]) {
				return;
			}

			const replacementNode = parseAsExpressionStatement(`
				_ADAPT_RT_.adaptStaticURL("${assetURLsMap[value]}")
			`);

			return replacementNode;
		},
	});
}
