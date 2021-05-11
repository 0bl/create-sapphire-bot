import { CommonJsReplacer, ESModuleReplacer, replace, ReplacerOptions, replacerRegExp } from '../../../src';

describe('VariableReplacer', () => {
	test('GIVEN instanceof replacerRegExp THEN returns RegExp', () => {
		expect(replacerRegExp).toBeInstanceOf(RegExp);
	});

	describe('TypeScript', () => {
		const gitignoreFileTemplate = [
			'# Ignore a blackhole and the folder for development',
			'node_modules/',
			'.vs/',
			'.idea/',
			'*.iml',
			'',
			'# Environment variables',
			'.DS_Store',
			'',
			'dist/',
			'*.js',
			'',
			'# Ignore the config file (contains sensitive information such as tokens)',
			'config.ts',
			'',
			'# Ignore heapsnapshot and log files',
			'*.heapsnapshot',
			'*.log',
			'',
			'# Ignore package locks',
			'{ignored-package-locks}',
			''
		].join('\n');

		const mainFileName = '{name}.ts';
		const mainFileTemplate = [
			"import { LogLevel, SapphireClient } from '@sapphire/framework';",
			"import '@sapphire/plugin-logger/register';",
			"import { BOT_TOKEN } from './config{import-extension}';",
			'',
			'const client = new SapphireClient({',
			"	defaultPrefix: '$',",
			'	logger: { level: LogLevel.Trace }',
			'});',
			''
		].join('\n');

		describe('TypeScript -> CommonJS', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.js',
				importExtension: '',
				ignoredPackageLocks: ['package-lock.json', 'npm-shrinkwrap.json', 'npm-debug.log'],
				name: 'sapphire',
				replacer: new CommonJsReplacer()
			};

			test('GIVEN default .gitignore file template THEN returns valid file', () => {
				expect(replace(gitignoreFileTemplate, replacerOptions)).toBe(
					[
						'# Ignore a blackhole and the folder for development',
						'node_modules/',
						'.vs/',
						'.idea/',
						'*.iml',
						'',
						'# Environment variables',
						'.DS_Store',
						'',
						'dist/',
						'*.js',
						'',
						'# Ignore the config file (contains sensitive information such as tokens)',
						'config.ts',
						'',
						'# Ignore heapsnapshot and log files',
						'*.heapsnapshot',
						'*.log',
						'',
						'# Ignore package locks',
						'package-lock.json',
						'npm-shrinkwrap.json',
						'npm-debug.log',
						''
					].join('\n')
				);
			});

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("export const BOT_TOKEN = '';\n", replacerOptions)).toBe("export const BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.ts');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"import { LogLevel, SapphireClient } from '@sapphire/framework';",
						"import '@sapphire/plugin-logger/register';",
						"import { BOT_TOKEN } from './config';",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});

		describe('TypeScript -> ECMAScript', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.ts',
				importExtension: '.js',
				ignoredPackageLocks: ['package-lock.json'],
				name: 'sapphire',
				replacer: new ESModuleReplacer()
			};

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("export const BOT_TOKEN = '';\n", replacerOptions)).toBe("export const BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.ts');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"import { LogLevel, SapphireClient } from '@sapphire/framework';",
						"import '@sapphire/plugin-logger/register';",
						"import { BOT_TOKEN } from './config.js';",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});
	});

	describe('JavaScript', () => {
		const mainFileName = '{name}{file-extension}';
		const mainFileTemplate = [
			'{import:@sapphire/framework, LogLevel SapphireClient};',
			'{import:@sapphire/plugin-logger/register};',
			'{import:./config, BOT_TOKEN};',
			'',
			'const client = new SapphireClient({',
			"	defaultPrefix: '$',",
			'	logger: { level: LogLevel.Trace }',
			'});',
			''
		].join('\n');

		describe('CommonJS', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.js',
				importExtension: '',
				ignoredPackageLocks: ['package-lock.json'],
				name: 'sapphire',
				replacer: new CommonJsReplacer()
			};

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("{export:BOT_TOKEN} '';\n", replacerOptions)).toBe("exports.BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.js');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"const { LogLevel, SapphireClient } = require('@sapphire/framework');",
						"require('@sapphire/plugin-logger/register');",
						"const { BOT_TOKEN } = require('./config');",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});

		describe('CommonJS (.cjs)', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.cjs',
				importExtension: '',
				ignoredPackageLocks: ['package-lock.json'],
				name: 'sapphire',
				replacer: new CommonJsReplacer()
			};

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("{export:BOT_TOKEN} '';\n", replacerOptions)).toBe("exports.BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.cjs');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"const { LogLevel, SapphireClient } = require('@sapphire/framework');",
						"require('@sapphire/plugin-logger/register');",
						"const { BOT_TOKEN } = require('./config');",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});

		describe('ECMAScript Modules', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.js',
				importExtension: '.js',
				ignoredPackageLocks: ['package-lock.json'],
				name: 'sapphire',
				replacer: new ESModuleReplacer()
			};

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("{export:BOT_TOKEN} '';\n", replacerOptions)).toBe("export const BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.js');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"import { LogLevel, SapphireClient } from '@sapphire/framework';",
						"import '@sapphire/plugin-logger/register';",
						"import { BOT_TOKEN } from './config.js';",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});

		describe('ECMAScript Modules (.mjs)', () => {
			const replacerOptions: ReplacerOptions = {
				fileExtension: '.mjs',
				importExtension: '.mjs',
				ignoredPackageLocks: ['package-lock.json'],
				name: 'sapphire',
				replacer: new ESModuleReplacer()
			};

			test('GIVEN default configuration file template THEN returns valid code', () => {
				expect(replace("{export:BOT_TOKEN} '';\n", replacerOptions)).toBe("export const BOT_TOKEN = '';\n");
			});

			test('GIVEN default main file name THEN returns valid code', () => {
				expect(replace(mainFileName, replacerOptions)).toBe('sapphire.mjs');
			});

			test('GIVEN default main file template THEN returns valid code', () => {
				expect(replace(mainFileTemplate, replacerOptions)).toBe(
					[
						"import { LogLevel, SapphireClient } from '@sapphire/framework';",
						"import '@sapphire/plugin-logger/register';",
						"import { BOT_TOKEN } from './config.mjs';",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	logger: { level: LogLevel.Trace }',
						'});',
						''
					].join('\n')
				);
			});
		});
	});
});
