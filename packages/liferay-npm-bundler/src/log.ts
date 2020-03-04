/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as fmt from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';

let debugOn: boolean, infoOn: boolean, errorOn: boolean, warnOn: boolean;

/* eslint-disable no-fallthrough */
switch (project.misc.logLevel) {
	case 'debug':
		debugOn = true;
	case 'info':
		infoOn = true;
	case 'warn':
		warnOn = true;
	case 'error':
	default:
		errorOn = true;
	case 'off':
}
/* eslint-enable no-fallthrough */

export function error(...args: unknown[]): void {
	if (!errorOn) {
		return;
	}

	fmt.print(fmt.error`${args.join(' ')}`);
}

export function warn(...args: unknown[]): void {
	if (!warnOn) {
		return;
	}

	fmt.print(fmt.warn`${args.join(' ')}`);
}

export function success(...args: unknown[]): void {
	if (!errorOn) {
		return;
	}

	fmt.print(fmt.success`${args.join(' ')}`);
}

export function info(...args: unknown[]): void {
	if (!infoOn) {
		return;
	}

	fmt.print(fmt.info`${args.join(' ')}`);
}

export function debug(...args: unknown[]): void {
	if (!debugOn) {
		return;
	}

	fmt.print(fmt.debug`${args.join(' ')}`);
}
