/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import {format} from 'liferay-js-toolkit-core';
import path from 'path';

import {getLiferayDir, project} from '../config';

const {print, success} = format;

/**
 *
 */
export default function (): void {
	const liferayDirPath = getLiferayDir();
	const jarName = project.jar.outputFilename;

	fs.copyFileSync(
		project.jar.outputDir.join(jarName).asNative,
		path.join(liferayDirPath, 'osgi', 'modules', jarName)
	);

	print(success`Deployed ${jarName} to ${liferayDirPath}`);
}
