import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import {DEFAULT_SETTINGS} from './constants';

/**
 * Generator to add settings configuration support to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await promptWithConfig(this, 'facet-settings', [
			{
				type: 'confirm',
				name: 'useSettings',
				message:
					'Do you want to add settings support?\n' +
					'  (👀 needs JS Portlet Extender 1.1.0)',
				// TODO: change to true once Extender 1.1.0 is relased
				default: false,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.useSettings) {
			return;
		}

		const cp = new Copier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const projectAnalyzer = new ProjectAnalyzer(this);

		npmbundlerrc.setFeature('settings', DEFAULT_SETTINGS);

		let context = {
			name: '',
		};

		if (!projectAnalyzer.hasLocalization && projectAnalyzer.description) {
			context.name = `"name": "${projectAnalyzer.description}",`;
		}

		cp.copyDir('features', {context});
	}
}
