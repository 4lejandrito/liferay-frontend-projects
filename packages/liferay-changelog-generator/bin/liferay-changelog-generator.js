#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const main = require('../src');

main(...process.argv).catch(err => {
	process.stderr.write(`${err}\n`);
	process.exit(1);
});
