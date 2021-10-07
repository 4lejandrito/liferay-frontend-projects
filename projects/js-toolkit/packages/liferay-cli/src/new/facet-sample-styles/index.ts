/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	format,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import type {Facet, Options} from '../index';

const {
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		const stylesFile: FilePath = options.outputPath.join(
			'src/css/styles.scss'
		);

		if (fs.existsSync(stylesFile.asNative)) {
			print(info`  Adding CSS styles`);

			await transformTextFile(
				stylesFile,
				stylesFile,
				appendLines(
					'.pre {',
					'	font-family: monospace;',
					'	white-space: pre;',
					'}',
					'',
					'.tag {',
					'	font-weight: bold;',
					'	margin-right: 1em;',
					'}',
					'',
					'.value {',
					'	font-family: monospace;',
					'}'
				)
			);
		}
	},
};

export default facet;
