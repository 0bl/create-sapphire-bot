import { CommonJsReplacer, IReplacer } from '../../../src';

describe('CommonJsReplacer', () => {
	const replacer = new CommonJsReplacer();
	// eslint-disable-next-line @typescript-eslint/dot-notation
	const replaceImport = replacer['replaceImport'].bind(replacer);
	// eslint-disable-next-line @typescript-eslint/dot-notation
	const replaceExport = replacer['replaceExport'].bind(replacer);

	test('GIVEN instanceof check on IReplacer THEN returns true', () => {
		expect(replacer).toBeInstanceOf(IReplacer);
	});

	describe('replaceImport', () => {
		test('GIVEN no variables THEN returns require-only statement', () => {
			expect(replaceImport('@sapphire/framework', [])).toBe("require('@sapphire/framework')");
		});

		test('GIVEN one variable THEN returns require with one variable', () => {
			expect(replaceImport('@sapphire/framework', ['SapphireClient'])).toBe("const { SapphireClient } = require('@sapphire/framework')");
		});

		test('GIVEN two variables THEN returns require with two variables joined by comma', () => {
			expect(replaceImport('@sapphire/framework', ['SapphireClient', 'Store'])).toBe(
				"const { SapphireClient, Store } = require('@sapphire/framework')"
			);
		});
	});

	describe('replaceExport', () => {
		test('GIVEN null name THEN returns `module.exports` statement', () => {
			expect(replaceExport(null)).toBe('module.exports =');
		});

		test('GIVEN non-null name THEN returns `exports.{name}` statement', () => {
			expect(replaceExport('client')).toBe('exports.client =');
		});
	});
});
