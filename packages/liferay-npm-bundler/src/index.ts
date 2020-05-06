/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import project from 'liferay-npm-build-tools-common/lib/project';
import {ProjectType} from 'liferay-npm-build-tools-common/lib/project/probe';
import pretty from 'pretty-time';

import {buildBundlerDir} from './dirs';
import createJar from './jar';
import * as log from './log';
import manifest from './manifest';
import report from './report';
import adaptCreateReactApp from './steps/adapt/create-react-app';
import bundle from './steps/bundle';
import runRules from './steps/rules';
import {abort} from './util';

/** Default entry point for the liferay-npm-bundler */
export default async function(argv: {version: boolean}): Promise<void> {
	if (argv.version) {
		const {versionsInfo} = project;

		versionsInfo.forEach((value, key) => {
			// eslint-disable-next-line no-console
			console.log(`"${key}":`, JSON.stringify(value, null, 2));
		});

		return;
	}

	try {
		const {pkgJson, versionsInfo} = project;
		const rootPkg = new PkgDesc(pkgJson.name, pkgJson.version);

		const start = process.hrtime();

		// Report configurations
		report.rootPackage(rootPkg);
		report.rulesConfig(project.rules.config);
		report.versionsInfo(versionsInfo);

		// Initialize package.json and manifest.json files
		copyPackageJson();
		addRootPackageToManifest(rootPkg);

		// Run main process
		switch (project.probe.type) {
			case ProjectType.BUNDLER:
				await bundle();
				await runRules(rootPkg);
				break;

			case ProjectType.CREATE_REACT_APP:
				await adaptCreateReactApp();
				break;

			default:
				abort(
					`Unsupported project type '${project.probe.type}': cannot run liferay-npm-bundler`
				);
		}

		// Write manifest
		saveManifest();

		// Create final JAR
		if (project.jar.supported) {
			await createJar();
		}

		// Report and show execution time
		const hrtime = process.hrtime(start);
		report.executionTime(hrtime);
		log.success(`Bundled {${pkgJson.name}} in`, pretty(hrtime));

		// Write report if requested
		if (project.misc.reportFile) {
			fs.writeFileSync(project.misc.reportFile.asNative, report.toHtml());

			log.info(`Report written to ${project.misc.reportFile.asNative}`);
		} else if (report.warningsPresent) {
			log.debug('The build has emitted some warning messages.');
		}
	} catch (err) {
		log.error(`\n\n${err.stack}\n\n`);

		process.exit(1);
	}
}

function addRootPackageToManifest(rootPkg: PkgDesc): void {
	manifest.addPackage(
		rootPkg,
		rootPkg.clone({dir: buildBundlerDir.asNative})
	);
}

function copyPackageJson(): void {
	fs.copyFileSync(
		project.dir.join('package.json').asNative,
		buildBundlerDir.join('package.json').asNative
	);

	log.debug('Copied package.json to output directory');
}

function saveManifest(): void {
	manifest.save(buildBundlerDir.join('manifest.json').asNative);

	log.debug('Wrote manifest.json to output directory');
}
