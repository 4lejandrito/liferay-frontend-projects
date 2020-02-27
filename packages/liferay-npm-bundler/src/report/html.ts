/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import pretty from 'pretty-time';

import {Report} from '.';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

const LOG_LEVEL_SORT = {
	error: 0,
	warn: 1,
	info: 2,
};

export function htmlDump(report: Report): string {
	const {
		_executionDate,
		_executionTime,
		_rootPkg,
		_rules,
		_versionsInfo,
		_warnings,
	} = report;

	const title = 'Report of liferay-npm-bundler execution';

	const summary = htmlTable([
		htmlRow(
			`<td>Executed at:</td><td>${_executionDate.toUTCString()}</td>`
		),
		htmlIf(_executionTime !== undefined, () =>
			htmlRow(
				`<td>Execution took:</td><td>${pretty(_executionTime)}</td>`
			)
		),
	]);

	const warnings = htmlIf(_warnings.length > 0, () =>
		htmlSection('Warnings', htmlList(..._warnings))
	);

	const projectInfo = htmlSection(
		'Project information',
		htmlTable(
			'Name',
			'Version',
			htmlRow(`
				<td>${_rootPkg.name}</td>
				<td>${_rootPkg.version}</td>
			`)
		)
	);

	const versionsInfo = htmlSection(
		'Bundler environment versions',
		htmlTable(
			'Package',
			'Version',
			Object.keys(_versionsInfo).map(pkgName =>
				htmlRow(`
					<td>${pkgName}</td>
					<td>${_versionsInfo[pkgName].version}</td>
				`)
			)
		)
	);

	const rulesExecution = htmlIf(Object.keys(_rules.files).length > 0, () =>
		htmlSection(
			'Details of rule executions',
			`
		<div class="configuration">
			<div>Configuration</div>
			<pre>${JSON.stringify(_rules.config, null, 2)}</pre>
		</div>
		`,
			htmlLogOutput(
				['File'],
				Object.keys(_rules.files)
					.sort()
					.map(filePath => [filePath]),
				Object.keys(_rules.files)
					.sort()
					.map(filePath => _rules.files[filePath].logger)
			)
		)
	);

	return `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<title>${title}</title>
				<style>
					body, h1, h2, h3, p, li {
						font-family: sans-serif;
					}
					
					body, p, th, td, li {
						font-size: 10pt;
					}
					
					h1 {
						font-size: 16pt;
						margin: 1em 0 .5em 0;
					}
					
					h2 {
						font-size: 13pt;
						margin: 1em 0 .5em 0;
					}
					
					h3 {
						font-size: 11pt;
						margin: 1em 0 .5em 0;
					}
					
					table {
						margin: 0 0 .5em 0;
					}
					
					tr:nth-child(odd) {
						background-color: #F6F6F6;
					}
					
					th {
						background-color: #F0F0F0;
						text-align: left;
					}
					
					th, td {
						padding: .1em 0;
						vertical-align: top;
					}
					
					td.info, td.warn, td.error {
						background: green;
						border-radius: 4px;
						color: white;
						text-align: center;
						vertical-align: middle;
						width: 1px;
						white-space: nowrap;
					}

					td.warn {
						background: orange;
					}

					td.error {
						background: red;
					}
					
					td.source {
						white-space: nowrap;
					}

					ul {
						padding-left: 1em;
						margin: 0 0 .5em 0;
					}
					
					p {
						margin: 0 0 .5em 0;
					}

					a {
						text-decoration: none;
						color: #055;
					}

					#log-level-selector {
						position: fixed;
						top: 1em;
						right: 1em;
						background-color: #eee;
						padding: .3em;
						border-radius: 4px;
						font-size: 8pt;
						border: 1px solid #ccc;
					}

					#log-level-selector select {
						font-size: 8pt;
					}

					.configuration {
						display: inline-block;
						margin-bottom: .5em;
					}

					.configuration > div {
						background-color: #f0f0f0;
						cursor: pointer;
						border-radius: 4px;
						padding: 2px;
						display: inline;
					}

					.configuration > div:after {
						content: "👀";
						padding: 0 .5em;
					}

					.configuration > pre {
						font-size: 8pt;
						display: none;
					}

					.configuration:hover > pre {
						display: block;
					}
				</style>
				<script id="report" type="application/json">
					${JSON.stringify(report)}
				</script>
				<script>
					window.report = JSON.parse(
						document.getElementById("report").innerHTML
					);
				</script>
				<script>
					window.onload = function() {
						var style = document.createElement('style');

						style.innerHTML = '';

						document.head.appendChild(style);

						var select = document.getElementById('log-level-select');

						select.value = 'info';

						select.onchange = function() {
							switch(select.value) {
								case 'info':
									style.innerHTML = '';
									break;

								case 'warn':
									style.innerHTML = 
										'tr.info {display: none;}';
									break;

								case 'error':
									style.innerHTML = 
										'tr.info {display: none;} ' +
										'tr.warn {display: none;}';
									break;
							}
						};
					}
				</script>
			</head>
			<body>
				<div id='log-level-selector'>
					Log level filter: 
					<select id='log-level-select'>
						<option>info</option>
						<option>warn</option>
						<option>error</option>
					</select>
				</div>
				
				<h1>${title}</h1>
				${summary}
				${warnings}
				${projectInfo}
				${versionsInfo}
				${rulesExecution}
			</body>
		</html>
	`;
}

function htmlIf(condition: boolean, contentGenerator: {(): string}): string {
	return condition ? contentGenerator() : '';
}

function htmlSection(title: string, ...contents: string[]): string {
	return `
		<h2>${title}</h2>
		${contents.join('\n')}
	`;
}

function htmlSubsection(title: string, ...contents: string[]): string {
	return `
		<h3>${title}</h3>
		${contents.join('\n')}
	`;
}

function htmlList(...args: string[]): string {
	return `
		<ul>
			${args.map(arg => `<li>${arg}</li>`).join(' ')}
		</ul>
	`;
}

function htmlTable(...args: any[]): string {
	const columns = args.slice(0, args.length - 1);
	let content = args[args.length - 1];

	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	if (columns.length == 0) {
		return `
			<table>
				${content}
			</table>
		`;
	} else {
		return `
			<table>
				${htmlRow(columns.map(column => `<th>${column}</th>`))}
				${content}
			</table>
		`;
	}
}

function htmlRow(content: string | string[], className: string = ''): string {
	if (Array.isArray(content)) {
		content = content.join('\n');
	}

	return `<tr class="${className}">${content}</tr>`;
}

/**
 * Dump a table with the output of a PluginLogger
 * @param prefixCells
 * an array with one array per row containing the prefix cell content
 * @param rowLoggers an array with one logger per row in prefixCells
 * @param source whether or not to show 'Log source' column
 * @return an HTML table
 */
function htmlLogOutput(
	prefixColumns: string[],
	prefixCells: string[][],
	rowLoggers: PluginLogger[],
	{source}: {source: boolean} = {source: true}
): string {
	if (prefixCells.length != rowLoggers.length) {
		throw new Error(
			'The length of prefixCells and rowLoggers must be the same'
		);
	}

	const logColums = ['Message', '', ''];

	if (source) {
		logColums.splice(0, 0, 'Log source');
	}

	const columns = prefixColumns.concat(logColums);

	const rows = [];

	prefixCells.forEach((cells, i) => {
		if (cells.length != prefixColumns.length) {
			throw new Error(
				`Prefix cells row ${i} has an invalid length: ${cells.length}`
			);
		}

		const msgs = rowLoggers[i].messages;

		if (msgs.length == 0) {
			rows.push(
				htmlRow(`
					${cells.map(cell => `<td>${cell}</td>`).join(' ')}
					${htmlIf(source, () => `<td></td>`)}
					${logColums
						.splice(1)
						.map(() => '<td></td>')
						.join(' ')}
				`)
			);
		} else {
			msgs.sort(
				(a, b) =>
					(LOG_LEVEL_SORT[a.level] || 999) -
					(LOG_LEVEL_SORT[b.level] || 999)
			);

			const msg0 = msgs[0];

			let sourceCell = htmlIf(
				source,
				() => `<td class="source">${msg0.source}</td>`
			);

			let infoLink = htmlIf(
				msg0['link'] !== undefined,
				() => `<a href='${msg0['link']}'>🛈</a>`
			);

			rows.push(
				htmlRow(
					`
					${cells.map(cell => `<td>${cell}</td>`).join(' ')}
					${sourceCell}
					<td class="${msg0.level}">${msg0.level.toUpperCase()}</td>
					<td>${infoLink}</td>
					<td>${msg0.things.join(' ')}</td>
				`,
					msg0.level
				)
			);

			for (let i = 1; i < msgs.length; i++) {
				sourceCell = htmlIf(
					source,
					() => `<td class="source">${msgs[i].source}</td>`
				);

				infoLink = htmlIf(
					msgs[i]['link'] !== undefined,
					() => `<a href='${msgs[i]['link']}'>🛈</a>`
				);

				rows.push(
					htmlRow(
						`
						${cells.map(() => `<td></td>`).join(' ')}
						${sourceCell}
						<td class="${msgs[i].level}">
							${msgs[i].level.toUpperCase()}
						</td>
						<td>${infoLink}</td>
						<td>${msgs[i].things.join(' ')}</td>
					`,
						msgs[i].level
					)
				);
			}
		}
	});

	return htmlTable(...columns, rows);
}
