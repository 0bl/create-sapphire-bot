import type { FileExtension, ImportExtension } from '../shared';
import type { IReplacer } from './IReplacer';

export interface ReplacerOptions {
	replacer: IReplacer;

	/**
	 * @replaces {file-extension}
	 */
	fileExtension: FileExtension;

	/**
	 * @replaces {import-extension}
	 */
	importExtension: ImportExtension;

	/**
	 * @replaces {name}
	 */
	name: string;

	/**
	 * @replaces {ignored-package-locks}
	 */
	ignoredPackageLocks: readonly string[];
}

export const replacerRegExp = /\{(file-extension|import-extension|name|ignored-package-locks)\}/g;

export function replace(value: string, options: ReplacerOptions) {
	return options.replacer.replace(value).replace(replacerRegExp, (_, type) => {
		switch (type as 'file-extension' | 'import-extension' | 'name' | 'ignored-package-locks') {
			case 'file-extension':
				return options.fileExtension;
			case 'import-extension':
				return options.importExtension;
			case 'name':
				return options.name;
			case 'ignored-package-locks':
				return options.ignoredPackageLocks.join('\n');
		}
	});
}
