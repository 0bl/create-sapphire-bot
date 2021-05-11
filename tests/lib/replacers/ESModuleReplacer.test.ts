import { ESModuleReplacer, IReplacer } from '../../../src';

describe('ESModuleReplacer', () => {
	const replacer = new ESModuleReplacer();
	// eslint-disable-next-line @typescript-eslint/dot-notation
	const replaceImport = replacer['replaceImport'].bind(replacer);
	// eslint-disable-next-line @typescript-eslint/dot-notation
	const replaceExport = replacer['replaceExport'].bind(replacer);

	test('GIVEN instanceof check on IReplacer THEN returns true', () => {
		expect(replacer).toBeInstanceOf(IReplacer);
	});

	describe('replaceImport', () => {
		test('GIVEN no variables THEN returns import-only statement', () => {
			expect(replaceImport('@sapphire/framework', [])).toBe("import '@sapphire/framework'");
		});

		test('GIVEN one variable THEN returns import with one variable', () => {
			expect(replaceImport('@sapphire/framework', ['SapphireClient'])).toBe("import { SapphireClient } from '@sapphire/framework'");
		});

		test('GIVEN two variables THEN returns import with two variables joined by comma', () => {
			expect(replaceImport('@sapphire/framework', ['SapphireClient', 'Store'])).toBe(
				"import { SapphireClient, Store } from '@sapphire/framework'"
			);
		});
	});

	describe('replaceExport', () => {
		test('GIVEN null name THEN returns `export default` statement', () => {
			expect(replaceExport(null)).toBe('export default');
		});

		test('GIVEN non-null name THEN returns `export {name}` statement', () => {
			expect(replaceExport('client')).toBe('export const client =');
		});
	});
});
