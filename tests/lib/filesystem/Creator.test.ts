import { randomUUID } from 'crypto';
import { readdir, readFile, rm, stat } from 'fs/promises';
import nock from 'nock';
import { tmpdir } from 'os';
import { join } from 'path';
import {
	CommonJsReplacer,
	createDirectory,
	createEntry,
	createFile,
	createPackage,
	createTree,
	Directory,
	fetchLastVersion,
	fetchLastVersions,
	File,
	ReplacerOptions,
	Template
} from '../../../src';

declare module 'crypto' {
	function randomUUID(options?: { disableEntropyCache?: boolean }): string;
}

describe('Creator', () => {
	const root = tmpdir();
	const fileExtension = '.js';
	const ignoredPackageLocks: string[] = [];
	const importExtension = '';
	const name = 'sapphire';
	const replacer = new CommonJsReplacer();
	const replacerOptions: ReplacerOptions = { fileExtension, ignoredPackageLocks, importExtension, name, replacer };

	describe('createFile', () => {
		test('GIVEN a file THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const file = new File(uuid, "export const BOT_TOKEN = '';");

			// Act & Assert
			await expect(createFile(root, file, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isFile())).resolves.toBe(true);
			await expect(readFile(path, 'utf8')).resolves.toBe("export const BOT_TOKEN = '';\n");

			// Tear Down
			await rm(path);
		});
	});

	describe('createDirectory', () => {
		test('GIVEN an empty directory THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const directory = new Directory(uuid);

			// Act & Assert
			await expect(createDirectory(root, directory, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
			await expect(readdir(path)).resolves.toEqual([]);

			// Tear Down
			await rm(path, { recursive: true });
		});

		test('GIVEN a filled directory THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const directory = new Directory(uuid).add('{name}{file-extension}', [
				'{import:@sapphire/framework, SapphireClient};',
				'',
				'{export:client} new SapphireClient();'
			]);

			// Act & Assert
			await expect(createDirectory(root, directory, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
			await expect(readdir(path)).resolves.toEqual(['sapphire.js']);
			await expect(readFile(join(path, 'sapphire.js'), 'utf8')).resolves.toBe(
				["const { SapphireClient } = require('@sapphire/framework');", '', 'exports.client = new SapphireClient();', ''].join('\n')
			);

			// Tear Down
			await rm(path, { recursive: true });
		});
	});

	describe('createEntry', () => {
		test('GIVEN a file THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const file = new File(uuid, "export const BOT_TOKEN = '';");

			// Act & Assert
			await expect(createEntry(root, file, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isFile())).resolves.toBe(true);
			await expect(readFile(path, 'utf8')).resolves.toBe("export const BOT_TOKEN = '';\n");

			// Tear Down
			await rm(path);
		});

		describe('Directory', () => {
			test('GIVEN an empty directory THEN writes correctly to disk', async () => {
				// Arrange
				const uuid = randomUUID();
				const path = join(root, uuid);

				const directory = new Directory(uuid);

				// Act & Assert
				await expect(createEntry(root, directory, replacerOptions)).resolves.toBeUndefined();
				await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
				await expect(readdir(path)).resolves.toEqual([]);

				// Tear Down
				await rm(path, { recursive: true });
			});

			test('GIVEN a filled directory THEN writes correctly to disk', async () => {
				// Arrange
				const uuid = randomUUID();
				const path = join(root, uuid);

				const directory = new Directory(uuid).add('{name}{file-extension}', [
					'{import:@sapphire/framework, SapphireClient};',
					'',
					'{export:client} new SapphireClient();'
				]);

				// Act & Assert
				await expect(createDirectory(root, directory, replacerOptions)).resolves.toBeUndefined();
				await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
				await expect(readdir(path)).resolves.toEqual(['sapphire.js']);
				await expect(readFile(join(path, 'sapphire.js'), 'utf8')).resolves.toBe(
					["const { SapphireClient } = require('@sapphire/framework');", '', 'exports.client = new SapphireClient();', ''].join('\n')
				);

				// Tear Down
				await rm(path, { recursive: true });
			});
		});
	});

	describe('createTree', () => {
		test('GIVEN an empty directory THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const directory = new Directory(uuid);

			// Act & Assert
			await expect(createTree(path, directory, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
			await expect(readdir(path)).resolves.toEqual([]);

			// Tear Down
			await rm(path, { recursive: true });
		});

		test('GIVEN a filled directory THEN writes correctly to disk', async () => {
			// Arrange
			const uuid = randomUUID();
			const path = join(root, uuid);

			const directory = new Directory(uuid).add('{name}{file-extension}', [
				'{import:@sapphire/framework, SapphireClient};',
				'',
				'{export:client} new SapphireClient();'
			]);

			// Act & Assert
			await expect(createTree(path, directory, replacerOptions)).resolves.toBeUndefined();
			await expect(stat(path).then((stat) => stat.isDirectory())).resolves.toBe(true);
			await expect(readdir(path)).resolves.toEqual(['sapphire.js']);
			await expect(readFile(join(path, 'sapphire.js'), 'utf8')).resolves.toBe(
				["const { SapphireClient } = require('@sapphire/framework');", '', 'exports.client = new SapphireClient();', ''].join('\n')
			);

			// Tear Down
			await rm(path, { recursive: true });
		});
	});

	describe('createPackage', () => {
		const dependencies: string[] = [];
		const devDependencies: string[] = [];
		const files = new Directory(':root-javascript');
		const main = 'src/{name}.js';
		const scripts = {
			lint: 'eslint src --ext js,mjs --fix',
			format: 'prettier --write "src/**/*.js"'
		};
		const template: Template = { dependencies, devDependencies, files, main, scripts };

		const baseReturnData = {
			name,
			version: '1.0.0',
			main: 'src/sapphire.js',
			license: 'MIT',
			private: true,
			scripts,
			dependencies: {},
			devDependencies: {},
			engines: {
				node: '>=14',
				npm: '>=6'
			},
			keywords: ['discord', 'sapphire', 'discord bot'],
			prettier: '@sapphire/prettier-config'
		};

		test('GIVEN no description, no email, and no author THEN it returns correct data', async () => {
			const promise = createPackage(name, template, {});
			await expect(promise).resolves.toStrictEqual({
				...baseReturnData,
				description: 'My first Sapphire bot!',
				author: ''
			});
		});

		test('GIVEN description, but no email nor author THEN it returns correct data', async () => {
			const promise = createPackage(name, template, { description: 'Hello World!' });
			await expect(promise).resolves.toStrictEqual({
				...baseReturnData,
				description: 'Hello World!',
				author: ''
			});
		});

		test('GIVEN description and email, but no author THEN it returns correct data', async () => {
			const promise = createPackage(name, template, { description: 'Hello World!', email: 'sapphire@example.com' });
			await expect(promise).resolves.toStrictEqual({
				...baseReturnData,
				description: 'Hello World!',
				author: ''
			});
		});

		test('GIVEN description and author, but no email THEN it returns correct data', async () => {
			const promise = createPackage(name, template, { description: 'Hello World!', author: 'Sapphire' });
			await expect(promise).resolves.toStrictEqual({
				...baseReturnData,
				description: 'Hello World!',
				author: 'Sapphire'
			});
		});

		test('GIVEN description, email, and author THEN it returns correct data', async () => {
			const promise = createPackage(name, template, { description: 'Hello World!', author: 'Sapphire', email: 'sapphire@example.com' });
			await expect(promise).resolves.toStrictEqual({
				...baseReturnData,
				description: 'Hello World!',
				author: 'Sapphire <sapphire@example.com>'
			});
		});
	});

	let scope: nock.Scope;

	beforeAll(() => {
		scope = nock('https://registry.npmjs.com')
			.persist()
			.get(`/${encodeURIComponent('discord.js')}`)
			.reply(200, { 'dist-tags': { latest: '13.0.0' } }, { 'Content-Type': 'application/json' })
			.get(`/${encodeURIComponent('@sapphire/pieces')}`)
			.reply(200, { 'dist-tags': { latest: '2.0.0' } }, { 'Content-Type': 'application/json' })
			.get(`/${encodeURIComponent('eslint')}`)
			.reply(200, { 'dist-tags': { latest: '8.0.0' } }, { 'Content-Type': 'application/json' })
			.get('/invalid')
			.reply(404, { error: 'Package does not exist' }, { 'Content-Type': 'application/json' })
			.get('/server-error')
			.reply(500, { error: 'Could not connect to server' }, { 'Content-Type': 'application/json' })
			.get('/reply-error')
			.replyWithError(new Error('Something really bad happened!'));
	});

	afterAll(() => {
		scope.persist(false);
		nock.restore();
	});

	describe('fetchLastVersion', () => {
		test('GIVEN discord.js THEN returns ^13.0.0', async () => {
			await expect(fetchLastVersion('discord.js')).resolves.toBe('^13.0.0');
		});

		test('GIVEN @sapphire/pieces THEN returns ^2.0.0', async () => {
			await expect(fetchLastVersion('@sapphire/pieces')).resolves.toBe('^2.0.0');
		});

		test('GIVEN eslint THEN returns ^8.0.0', async () => {
			await expect(fetchLastVersion('eslint')).resolves.toBe('^8.0.0');
		});

		test('GIVEN invalid dependency THEN throws error', async () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation();
			const error = jest.spyOn(console, 'error').mockImplementation();

			const promise = fetchLastVersion('invalid');
			await expect(promise).rejects.toThrowError("Could not find package 'invalid'.");
			await expect(promise).rejects.toBeInstanceOf(Error);
			expect(warn).toHaveBeenCalledTimes(0);
			expect(error).toHaveBeenCalledTimes(0);

			warn.mockRestore();
			error.mockRestore();
		});

		test('GIVEN dependency during server outage THEN throws error after 3 retries', async () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation();
			const error = jest.spyOn(console, 'error').mockImplementation();

			const promise = fetchLastVersion('server-error');
			await expect(promise).rejects.toThrowError("Failed to fetch the version for 'server-error'.");
			await expect(promise).rejects.toBeInstanceOf(Error);
			expect(warn).toHaveBeenCalledTimes(3);
			expect(error).toHaveBeenCalledTimes(0);

			warn.mockRestore();
			error.mockRestore();
		}, 10000);

		test('GIVEN dependency during network outage THEN throws error after 3 retries', async () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation();
			const error = jest.spyOn(console, 'error').mockImplementation();

			const promise = fetchLastVersion('reply-error');
			await expect(promise).rejects.toThrowError('Something really bad happened!');
			await expect(promise).rejects.toBeInstanceOf(Error);
			expect(warn).toHaveBeenCalledTimes(0);
			expect(error).toHaveBeenCalledTimes(3);

			warn.mockRestore();
			error.mockRestore();
		}, 10000);
	});

	describe('fetchLastVersions', () => {
		test('GIVEN eslint THEN returns an object containing eslint only', async () => {
			await expect(fetchLastVersions(['eslint'])).resolves.toStrictEqual({ eslint: '^8.0.0' });
		});

		test('GIVEN discord.js and @sapphire/pieces THEN returns an object containing both dependencies', async () => {
			await expect(fetchLastVersions(['discord.js', '@sapphire/pieces'])).resolves.toStrictEqual({
				'discord.js': '^13.0.0',
				'@sapphire/pieces': '^2.0.0'
			});
		});
	});
});
