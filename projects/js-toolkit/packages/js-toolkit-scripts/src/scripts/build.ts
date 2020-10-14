/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {runNodeModulesBin} from '@liferay/js-toolkit-core';

export default function (): void {
	runNodeModulesBin('liferay-npm-bundler');
}
