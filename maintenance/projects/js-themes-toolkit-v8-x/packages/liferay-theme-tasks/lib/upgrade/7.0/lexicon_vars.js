/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const removed = [
	'atlas-theme',
	'box-shadow-default',
	'box-shadow-default-bg',
	'box-shadow-default-blur',
	'box-shadow-default-spread',
	'box-shadow-default-x',
	'box-shadow-default-y',
	'brand-danger-active',
	'brand-danger-hover',
	'brand-default',
	'brand-default-active',
	'brand-default-hover',
	'brand-info-active',
	'brand-info-hover',
	'brand-primary-active',
	'brand-primary-hover',
	'brand-success-active',
	'brand-success-hover',
	'brand-warning-active',
	'brand-warning-hover',
	'inverse-active-bg',
	'inverse-active-border',
	'inverse-active-color',
	'inverse-bg',
	'inverse-border',
	'inverse-color',
	'inverse-disabled-color',
	'inverse-header-bg',
	'inverse-header-border',
	'inverse-header-color',
	'inverse-hover-bg',
	'inverse-hover-border',
	'inverse-hover-color',
	'inverse-link-color',
	'inverse-link-hover-color',
	'state-danger-bg',
	'state-danger-border',
	'state-danger-text',
	'state-default-bg',
	'state-default-border',
	'state-default-text',
	'state-info-bg',
	'state-info-border',
	'state-info-text',
	'state-primary-bg',
	'state-primary-border',
	'state-primary-text',
	'state-success-bg',
	'state-success-border',
	'state-success-text',
	'state-warning-bg',
	'state-warning-border',
	'state-warning-text',
];

const rules = removed.map((varName) => {
	return {
		name: varName,
		message: `$${varName} was deprecated in Lexicon CSS 1.x.x and has been removed in the new Clay 2.x.x version`,
		regex: new RegExp(`\\$${varName}`, 'g'),
	};
});

module.exports = {
	removed,
	rules,
};
