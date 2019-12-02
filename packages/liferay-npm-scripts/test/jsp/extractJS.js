/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const extractJS = require('../../src/jsp/extractJS');
const dedent = require('../../support/dedent');
const getFixture = require('../../support/getFixture');

describe('extractJS()', () => {
	it('extracts "<aui:script>" tags', () => {
		const blocks = extractJS(dedent(3)`
			<aui:script use="other">
				alert(A.other.thing);
			</aui:script>
		`);

		expect(blocks).toEqual([
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
					alert(A.other.thing);
				`,
				match: dedent(4)`<aui:script use="other">
					alert(A.other.thing);
				</aui:script>`,
				openTag: '<aui:script use="other">',
				range: {
					end: {
						column: 1,
						line: 4
					},
					index: 1,
					length: 61,
					start: {
						column: 25,
						line: 2
					}
				},
				scriptAttributes: ' use="other"',
				tagNamespace: 'aui:'
			}
		]);
	});

	it('extracts bare "<script>" tags', () => {
		const blocks = extractJS(dedent(3)`
			<script>
				alert('Hello');
			</script>
		`);

		expect(blocks).toEqual([
			{
				closeTag: '</script>',
				contents: dedent(4)`
					alert('Hello');
				`,
				match: dedent(4)`<script>
					alert('Hello');
				</script>`,
				openTag: '<script>',
				range: {
					end: {
						column: 1,
						line: 4
					},
					index: 1,
					length: 35,
					start: {
						column: 9,
						line: 2
					}
				},
				scriptAttributes: '',
				tagNamespace: undefined
			}
		]);
	});

	it('extracts one-line "<script>" tags', () => {
		// Testing an edge-case in the `range` arithemetic.
		const blocks = extractJS("<script>alert('Hello');</script>");

		expect(blocks).toEqual([
			{
				closeTag: '</script>',
				contents: "alert('Hello');",
				match: "<script>alert('Hello');</script>",
				openTag: '<script>',
				range: {
					end: {
						column: 24,
						line: 1
					},
					index: 0,
					length: 32,
					start: {
						column: 9,
						line: 1
					}
				},
				scriptAttributes: '',
				tagNamespace: undefined
			}
		]);
	});

	it('skips empty tags', () => {
		const blocks = extractJS('<script></script>');

		expect(blocks).toEqual([]);
	});

	it('does not extract non-JavaScript scripts', () => {
		// (Abbreviated) example taken from:
		// https://github.com/liferay/liferay-portal/blob/44c1be7f1725ca00e9/modules/apps/calendar/calendar-web/src/main/resources/META-INF/resources/event_recorder.jspf
		let blocks = extractJS(`
			<script id="<portlet:namespace />eventRecorderHeaderTpl" type="text/x-alloy-template">
				alert('Hello');
			</script>
		`);

		expect(blocks).toEqual([]);

		// Counter-example:
		blocks = extractJS(`
			<script id="<portlet:namespace />eventRecorderHeaderTpl" type="text/javascript">
				alert('Hello');
			</script>
		`);

		expect(blocks).toEqual([
			{
				closeTag: '</script>',
				contents: "\n\t\t\t\talert('Hello');\n\t\t\t",
				match: `<script id="<portlet:namespace />eventRecorderHeaderTpl" type="text/javascript">
				alert('Hello');
			</script>`,
				openTag:
					'<script id="<portlet:namespace />eventRecorderHeaderTpl" type="text/javascript">',
				range: {
					end: {column: 4, line: 4},
					index: 4,
					length: 113,
					start: {column: 84, line: 2}
				},
				scriptAttributes:
					' id="<portlet:namespace />eventRecorderHeaderTpl" type="text/javascript"'
			}
		]);
	});

	it('extracts blocks from test fixture', async () => {
		// This is the test fixture from the check-source-formatting package.
		const source = await getFixture('jsp/page.jsp');

		const blocks = extractJS(source);

		expect(blocks).toEqual([
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						var testVar = true;
					`,
				match: dedent(4)`<aui:script>
						var testVar = true;
					</aui:script>`,
				openTag: '<aui:script>',
				range: {
					end: {
						column: 2,
						line: 32
					},
					index: 819,
					length: 49,
					start: {
						column: 14,
						line: 30
					}
				},
				scriptAttributes: '',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						var Liferay = true

						Liferay.Language.get('foo');

						Liferay.provide(
							window,
							'testFn',
							function() {
								var foo = false;
							}
						);
					`,
				match: dedent(4)`<aui:script use="aui-base,event,node">
						var Liferay = true

						Liferay.Language.get('foo');

						Liferay.provide(
							window,
							'testFn',
							function() {
								var foo = false;
							}
						);
					</aui:script>`,
				openTag: '<aui:script use="aui-base,event,node">',
				range: {
					end: {
						column: 2,
						line: 46
					},
					index: 871,
					length: 197,
					start: {
						column: 40,
						line: 34
					}
				},
				scriptAttributes: ' use="aui-base,event,node"',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						<%
						List<String> foo = null;
						%>

						foo();
					`,
				match: dedent(4)`<aui:script>
						<%
						List<String> foo = null;
						%>

						foo();
					</aui:script>`,
				openTag: '<aui:script>',
				range: {
					end: {
						column: 2,
						line: 54
					},
					index: 1071,
					length: 74,
					start: {
						column: 14,
						line: 48
					}
				},
				scriptAttributes: '',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						window.foo = 'foo';`,
				match: dedent(4)`<aui:script>
						window.foo = 'foo';</aui:script>`,
				openTag: '<aui:script>',
				range: {
					end: {
						column: 22,
						line: 81
					},
					index: 1716,
					length: 47,
					start: {
						column: 14,
						line: 80
					}
				},
				scriptAttributes: '',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						var SOME_OBJ = {
							'\${foo}': 'bar',
							'\${bar}': 'baz'
						};
					`,
				match: dedent(4)`<aui:script>
						var SOME_OBJ = {
							'\${foo}': 'bar',
							'\${bar}': 'baz'
						};
					</aui:script>`,
				openTag: '<aui:script>',
				range: {
					end: {
						column: 2,
						line: 88
					},
					index: 1766,
					length: 90,
					start: {
						column: 14,
						line: 83
					}
				},
				scriptAttributes: '',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: dedent(4)`
						alert(fooBarBaz);
						alert(bazFoo_bar);
						alert(FooBar);
					`,
				match: dedent(
					4
				)`<aui:script require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar">
						alert(fooBarBaz);
						alert(bazFoo_bar);
						alert(FooBar);
					</aui:script>`,
				openTag:
					'<aui:script require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar">',
				range: {
					end: {
						column: 2,
						line: 94
					},
					index: 1859,
					length: 143,
					start: {
						column: 72,
						line: 90
					}
				},
				scriptAttributes:
					' require="foo/bar/baz, baz/foo_bar, bar/baz/foo as FooBar"',
				tagNamespace: 'aui:'
			},
			{
				closeTag: '</aui:script>',
				contents: '\n\t',
				match: '<aui:script require="">\n\t</aui:script>',
				openTag: '<aui:script require="">',
				range: {
					end: {
						column: 2,
						line: 97
					},
					index: 2005,
					length: 38,
					start: {
						column: 25,
						line: 96
					}
				},
				scriptAttributes: ' require=""',
				tagNamespace: 'aui:'
			}
		]);
	});
});
