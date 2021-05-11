import { File } from '../../../src';

describe('File', () => {
	describe('String Content', () => {
		test('GIVEN empty file THEN it contains only a new line', () => {
			const value = new File('foo.js', '');

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe('\n');
		});

		test('GIVEN non-empty file THEN it contains the content and a trailing new line', () => {
			const value = new File('foo.js', "import '@sapphire/framework';");

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe("import '@sapphire/framework';\n");
		});

		test('GIVEN non-empty with trailing new line file THEN it contains the content without an extra new line', () => {
			const value = new File('foo.js', "import '@sapphire/framework';\n");

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe("import '@sapphire/framework';\n");
		});
	});

	describe('Array Content', () => {
		test('GIVEN empty file THEN it contains only a new line', () => {
			const value = new File('foo.js', []);

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe('\n');
		});

		test('GIVEN non-empty file THEN it contains the content and a trailing new line', () => {
			const value = new File('foo.js', ["import '@sapphire/framework';"]);

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe("import '@sapphire/framework';\n");
		});

		test('GIVEN non-empty with trailing new line file THEN it contains the content without an extra new line', () => {
			const value = new File('foo.js', ["import '@sapphire/framework';\n"]);

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe("import '@sapphire/framework';\n");
		});

		test('GIVEN non-empty file with multiple lines THEN it contains the content and a trailing new line', () => {
			const value = new File('foo.js', [
				"import { SapphireClient } '@sapphire/framework';", //
				'',
				'export const client = new SapphireClient();'
			]);

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe(
				["import { SapphireClient } '@sapphire/framework';", '', 'export const client = new SapphireClient();\n'].join('\n')
			);
		});

		test('GIVEN non-empty with multiple lines and a trailing new line file THEN it contains the content without an extra new line', () => {
			const value = new File('foo.js', [
				"import { SapphireClient } '@sapphire/framework';",
				'',
				'export const client = new SapphireClient();\n'
			]);

			expect(value.name).toBe('foo.js');
			expect(value.contents).toBe(
				["import { SapphireClient } '@sapphire/framework';", '', 'export const client = new SapphireClient();\n'].join('\n')
			);
		});
	});
});
