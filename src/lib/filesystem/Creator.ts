import { bold, cyan, red } from 'colorette';
import { mkdir, writeFile } from 'fs/promises';
import { get } from 'https';
import { join } from 'path';
import { URL } from 'url';
import { promisify } from 'util';
import { replace, ReplacerOptions } from '../replacers/VariableReplacer';
import type { Template } from '../shared';
import type { Directory } from '../tree/Directory';
import type { File } from '../tree/File';

export async function createFile(root: string, file: File, replacerOptions: ReplacerOptions) {
	const name = replace(file.name, replacerOptions);
	const contents = replace(file.contents, replacerOptions);

	await writeFile(join(root, name), contents, 'utf8');
}

export async function createDirectory(root: string, directory: Directory, replacerOptions: ReplacerOptions) {
	const name = replace(directory.name, replacerOptions);
	const nextRoot = join(root, name);

	await createTree(nextRoot, directory, replacerOptions);
}

export function createEntry(root: string, fileOrDirectory: File | Directory, replacerOptions: ReplacerOptions) {
	return fileOrDirectory instanceof Map
		? createDirectory(root, fileOrDirectory, replacerOptions)
		: createFile(root, fileOrDirectory, replacerOptions);
}

export async function createTree(root: string, directory: Directory, replacerOptions: ReplacerOptions) {
	await mkdir(root);

	const promises: Promise<void>[] = [];
	for (const fileOrDirectory of directory.values()) {
		promises.push(createEntry(root, fileOrDirectory, replacerOptions));
	}

	await Promise.all(promises);
}

export interface PackageMetaData {
	author?: string;
	email?: string;
	description?: string;
}

export async function createPackage(name: string, template: Template, metadata: PackageMetaData) {
	const [dependencies, devDependencies] = await Promise.all([
		fetchLastVersions(template.dependencies),
		fetchLastVersions(template.devDependencies)
	]);

	return {
		name,
		version: '1.0.0',
		description: metadata.description ?? 'My first Sapphire bot!',
		main: template.main.replace('{name}', name),
		author: metadata.author ? (metadata.email ? `${metadata.author} <${metadata.email}>` : metadata.author) : '',
		license: 'MIT',
		private: true,
		scripts: template.scripts,
		dependencies,
		devDependencies,
		engines: {
			node: '>=14',
			npm: '>=6'
		},
		keywords: ['discord', 'sapphire', 'discord bot'],
		prettier: '@sapphire/prettier-config'
	};
}

interface Result<T> {
	code: number;
	data: T;
}

function fetch<T>(url: URL): Promise<Result<T>> {
	return new Promise((resolve, reject) => {
		const request = get(url, async (result) => {
			const chunks: Buffer[] = [];
			for await (const chunk of result) {
				chunks.push(chunk);
			}

			resolve({ code: result.statusCode ?? 200, data: JSON.parse(Buffer.concat(chunks).toString('utf8')) });
		});
		request.once('error', reject);
		request.once('abort', () => reject(new Error('Aborted Error')));
	});
}

const sleep = promisify(setTimeout);
const retries = 3;
const lastRetry = retries - 1;

interface NpmRegistryInformation {
	'dist-tags': { latest: string };
}

export async function fetchLastVersion(name: string) {
	const url = new URL(`https://registry.npmjs.com/${encodeURIComponent(name)}`);

	for (let i = 0; i < retries; ++i) {
		let result: Result<NpmRegistryInformation>;
		try {
			result = await fetch<NpmRegistryInformation>(url);
		} catch (error) {
			const header = `${red('[ERROR]')} [${cyan(i.toString())} / 3]`;
			if (i >= lastRetry) {
				console.error(`${header} Received an error while fetching the package ${cyan(name)}.`);
				throw error;
			}

			console.error(`${header} Received an error while fetching the package ${cyan(name)}, retrying in ${bold('2 seconds')}.`, error);
			continue;
		}

		if (result.code === 404) throw new Error(`Could not find package '${name}'.`);
		if (result.code >= 200 && result.code < 400) return `^${result.data['dist-tags'].latest}`;

		const header = `${red('[ERROR]')} [${cyan(i.toString())} / 3]`;
		if (i >= lastRetry) {
			console.warn(`${header} Received code ${red(result.code.toString())} when fetching ${cyan(name)}.`);
		} else {
			console.warn(`${header} Received code ${red(result.code.toString())} when fetching ${cyan(name)}, retrying in ${bold('2 seconds')}.`);
		}

		await sleep(2000);
	}

	throw new Error(`Failed to fetch the version for '${name}'.`);
}

export async function fetchLastVersions(names: readonly string[]) {
	return Object.fromEntries(await Promise.all(names.map(async (name) => [name, await fetchLastVersion(name)])));
}
