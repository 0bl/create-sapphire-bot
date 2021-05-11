import { IReplacer } from './IReplacer';

export class CommonJsReplacer extends IReplacer {
	public readonly name = 'cjs';

	protected replaceImport(from: string, variables: string[]): string {
		return variables.length === 0 ? `require('${from}')` : `const { ${variables.join(', ')} } = require('${from}')`;
	}

	protected replaceExport(name: string | null): string {
		return name === null ? 'module.exports =' : `exports.${name} =`;
	}
}
