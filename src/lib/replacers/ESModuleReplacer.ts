import { IReplacer } from './IReplacer';

export class ESModuleReplacer extends IReplacer {
	public readonly name = 'esm';

	protected replaceImport(from: string, variables: string[]): string {
		if (from.startsWith('.') && !from.endsWith('.js')) from += '{file-extension}';
		return variables.length === 0 ? `import '${from}'` : `import { ${variables.join(', ')} } from '${from}'`;
	}

	protected replaceExport(name: string | null): string {
		return name === null ? 'export default' : `export const ${name} =`;
	}
}
