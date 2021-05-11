import {
	getOppositePackageManagerLocks,
	getPackageManager,
	getPackageManagerFromArgv,
	getPackageManagerVendorFiles,
	pick,
	shouldUseCommonJS,
	shouldUseTypeScript
} from '../../src';

describe('Shared', () => {
	describe('shouldUseTypeScript', () => {
		test('GIVEN undefined THEN returns false', () => {
			expect(shouldUseTypeScript(undefined)).toBe(false);
		});

		test('GIVEN JavaScript THEN returns false', () => {
			expect(shouldUseTypeScript('js')).toBe(false);
			expect(shouldUseTypeScript('javascript')).toBe(false);
		});

		test('GIVEN TypeScript THEN returns true', () => {
			expect(shouldUseTypeScript('ts')).toBe(true);
			expect(shouldUseTypeScript('typescript')).toBe(true);
		});
	});

	describe('shouldUseCommonJS', () => {
		test('GIVEN undefined THEN returns true', () => {
			expect(shouldUseCommonJS(undefined)).toBe(true);
		});

		test('GIVEN CommonJS THEN returns true', () => {
			expect(shouldUseCommonJS('cjs')).toBe(true);
			expect(shouldUseCommonJS('commonjs')).toBe(true);
			expect(shouldUseCommonJS('script')).toBe(true);
		});

		test('GIVEN ECMAScript THEN returns false', () => {
			expect(shouldUseCommonJS('esm')).toBe(false);
			expect(shouldUseCommonJS('ecmascript')).toBe(false);
			expect(shouldUseCommonJS('es6')).toBe(false);
			expect(shouldUseCommonJS('esnext')).toBe(false);
			expect(shouldUseCommonJS('module')).toBe(false);
		});
	});

	const manager = getPackageManagerFromArgv();
	const ensuredManager = manager ?? 'npm';

	describe('getPackageManagerFromArgv', () => {
		test('GIVEN no arguments THEN returns manager', () => {
			expect(getPackageManagerFromArgv()).toBe(manager);
		});
	});

	describe('getPackageManager', () => {
		test('GIVEN no arguments THEN returns manager from argv or npm', () => {
			expect(getPackageManager()).toBe(ensuredManager);
		});

		test('GIVEN empty object THEN returns manager from argv or npm', () => {
			expect(getPackageManager()).toBe(ensuredManager);
		});

		test('GIVEN `npm: true` THEN returns npm', () => {
			expect(getPackageManager({ npm: true })).toBe('npm');
		});

		test('GIVEN `yarn: true` THEN returns yarn', () => {
			expect(getPackageManager({ yarn: true })).toBe('yarn');
		});

		test('GIVEN `pnpm: true` THEN returns pnpm', () => {
			expect(getPackageManager({ pnpm: true })).toBe('pnpm');
		});

		test('GIVEN all true THEN returns npm', () => {
			expect(getPackageManager({ npm: true, yarn: true, pnpm: true })).toBe('npm');
		});

		test('GIVEN yarn and pnpm true THEN returns yarn', () => {
			expect(getPackageManager({ yarn: true, pnpm: true })).toBe('yarn');
		});
	});

	describe('getPackageManagerVendorFiles', () => {
		test("GIVEN npm THEN returns npm's vendored files", () => {
			expect(getPackageManagerVendorFiles('npm')).toEqual(['package-lock.json', 'npm-shrinkwrap.json', 'npm-debug.log']);
		});

		test("GIVEN yarn THEN returns yarn's vendored files", () => {
			expect(getPackageManagerVendorFiles('yarn')).toEqual(['yarn.lock', 'yarn-error.log', 'yarn-debug.log']);
		});

		test("GIVEN pnpm THEN returns pnpm's vendored files", () => {
			expect(getPackageManagerVendorFiles('pnpm')).toEqual(['pnpm-lock.yaml']);
		});
	});

	describe('getOppositePackageManagerLocks', () => {
		test("GIVEN npm THEN returns yarn's and pnpm's vendored files", () => {
			expect(getOppositePackageManagerLocks('npm')).toEqual(['yarn.lock', 'yarn-error.log', 'yarn-debug.log', 'pnpm-lock.yaml']);
		});

		test("GIVEN yarn THEN returns npm's and pnpm's vendored files", () => {
			expect(getOppositePackageManagerLocks('yarn')).toEqual(['package-lock.json', 'npm-shrinkwrap.json', 'npm-debug.log', 'pnpm-lock.yaml']);
		});

		test("GIVEN pnpm THEN returns npm's and yarn's vendored files", () => {
			expect(getOppositePackageManagerLocks('pnpm')).toEqual([
				'package-lock.json',
				'npm-shrinkwrap.json',
				'npm-debug.log',
				'yarn.lock',
				'yarn-error.log',
				'yarn-debug.log'
			]);
		});
	});

	describe('pick', () => {
		describe('TypeScript', () => {
			describe('CommonJS', () => {
				test('GIVEN `template: typescript` THEN returns a CommonJS TypeScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'typescript' });

					expect(data.template.files.name).toBe(':root-typescript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.ts');
					expect(data.replacerOptions.importExtension).toBe('');
					expect(data.replacerOptions.replacer.name).toBe('cjs');
				});

				test('GIVEN `template: typescript` and `extension: .cjs` THEN returns a CommonJS TypeScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'typescript', extension: '.cjs' });

					expect(data.template.files.name).toBe(':root-typescript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.ts');
					expect(data.replacerOptions.importExtension).toBe('');
					expect(data.replacerOptions.replacer.name).toBe('cjs');
				});
			});

			describe('ECMAScript Modules', () => {
				test('GIVEN `template: typescript` and `module: es6` THEN returns an ECMAScript TypeScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'typescript', module: 'es6' });

					expect(data.template.files.name).toBe(':root-typescript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.ts');
					expect(data.replacerOptions.importExtension).toBe('.js');
					expect(data.replacerOptions.replacer.name).toBe('esm');
				});

				test('GIVEN `template: typescript`, `extension: .mjs` and `module: es6` THEN returns an ECMAScript TypeScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'typescript', extension: '.mjs', module: 'es6' });

					expect(data.template.files.name).toBe(':root-typescript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.ts');
					expect(data.replacerOptions.importExtension).toBe('.mjs');
					expect(data.replacerOptions.replacer.name).toBe('esm');
				});
			});
		});

		describe('JavaScript', () => {
			describe('CommonJS', () => {
				test('GIVEN no template THEN returns a CommonJS JavaScript configuration', () => {
					const data = pick({ name: 'sapphire' });

					expect(data.template.files.name).toBe(':root-javascript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.js');
					expect(data.replacerOptions.importExtension).toBe('');
					expect(data.replacerOptions.replacer.name).toBe('cjs');
				});

				test('GIVEN `template: javascript` THEN returns a CommonJS JavaScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'javascript' });

					expect(data.template.files.name).toBe(':root-javascript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.js');
					expect(data.replacerOptions.importExtension).toBe('');
					expect(data.replacerOptions.replacer.name).toBe('cjs');
				});

				test('GIVEN `template: javascript` and `module: cjs` THEN returns a CommonJS JavaScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'javascript', module: 'cjs' });

					expect(data.template.files.name).toBe(':root-javascript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.js');
					expect(data.replacerOptions.importExtension).toBe('');
					expect(data.replacerOptions.replacer.name).toBe('cjs');
				});
			});

			describe('ECMAScript Modules', () => {
				test('GIVEN `template: javascript` and `module: es6` THEN returns an ECMAScript JavaScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'javascript', module: 'es6' });

					expect(data.template.files.name).toBe(':root-javascript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.mjs');
					expect(data.replacerOptions.importExtension).toBe('.mjs');
					expect(data.replacerOptions.replacer.name).toBe('esm');
				});

				test('GIVEN `template: javascript`, `extension: js` and `module: es6` THEN returns an ECMAScript JavaScript configuration', () => {
					const data = pick({ name: 'sapphire', template: 'javascript', extension: '.js', module: 'es6' });

					expect(data.template.files.name).toBe(':root-javascript');
					expect(data.replacerOptions.name).toBe('sapphire');
					expect(data.replacerOptions.fileExtension).toBe('.js');
					expect(data.replacerOptions.importExtension).toBe('.js');
					expect(data.replacerOptions.replacer.name).toBe('esm');
				});
			});
		});
	});
});
