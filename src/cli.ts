#!/usr/bin/env node

import { exec } from 'child_process';
import { bold, cyan, gray, green, red } from 'colorette';
import { Command } from 'commander';
import type { PathLike } from 'fs';
import { lstat, writeFile } from 'fs/promises';
import { join } from 'path';
import prompts from 'prompts';
import { promisify } from 'util';
import { createPackage, createTree } from './lib/filesystem/Creator';
import { FileExtension, ModuleType, PackageManager, pick, TemplateType } from './lib/shared';

let name!: string;
const command = new Command()
	.version('1.0.0')
	.arguments('[project-directory]')
	.usage(`${cyan('[project-directory]')} ${gray('[template]')}`)
	.action((projectDirectory) => {
		name = projectDirectory;
	})
	.option('--verbose', 'print additional information')
	.option('--author <name-of-author>', "the author's name, used in both package and LICENSE")
	.option('--email <email-of-author>', "the author's email, used in package's author field")
	.option('--description <description>', "the bot's description")
	.option('-T, --template <name-of-template>', 'the template to use')
	.option('-E, --extension <name-of-extension>', 'the extension to use')
	.option('--use-npm')
	.option('--use-yarn')
	.option('--use-pnpm')
	.on('--help', () => {
		const indent = ' '.repeat(4);
		const indent2 = indent.repeat(2);
		const indent3 = indent.repeat(3);

		console.log(
			[
				'',
				`${indent}A custom ${cyan('--template')} can be one of:`,
				`${indent2}- ${green('ts')}`,
				`${indent2}- ${green('typescript')}`,
				`${indent2}- ${green('js')}`,
				`${indent2}- ${green('javascript')}`,

				'',
				`${indent}A custom ${cyan('--module')} can be one of:`,
				`${indent2}- ${green('cjs')} ${gray('(CommonJS Modules)')}`,
				`${indent2}- ${green('esm')} ${gray('(ECMAScript Modules)')}`,
				`${indent2}${gray(`> Defaults to ${bold('cjs')}.`)}`,

				'',
				`${indent}A custom ${cyan('--extension')} can be one of:`,
				`${indent2}- ${green('.js')}`,
				`${indent2}- ${green('.cjs')} ${gray('(CommonJS Modules)')}`,
				`${indent2}- ${green('.mjs')} ${gray('(ECMAScript Modules)')}`,
				`${indent2}${gray(`> Defaults to ${bold('.js')} if:`)}`,
				`${indent3}${gray(`- ${bold('--template')} is ${bold('typescript')}`)}`,
				`${indent3}${gray(`- ${bold('--module')} is ${bold('cjs')}`)}`
			].join('\n')
		);
	});

const program = command.parse(process.argv);
const options = program.opts() as Options;
const execAsync = promisify(exec);
const existsAsync = (path: PathLike) =>
	lstat(path)
		.then(() => true)
		.catch(() => false);

async function install(cwd: string, manager: PackageManager) {
	console.log(`${cyan('[INFO]')} Installing dependencies with ${bold(cyan(manager))}, this might take a while...`);
	await execAsync(`${manager} install`, { cwd });
}

const nameRegExp = /^[a-z\-]{2,}$/;
async function askName() {
	const { name } = await prompts<'name'>({
		type: 'text',
		name: 'name',
		message: "What will be your bot's name?",
		validate: (value) => nameRegExp.test(value) || 'Your name may only contain lower-case characters and dashes'
	});

	if (name) return name;

	console.error(`${red('[ERROR]')} No name was given, unable to continue.`);
	process.exit(1);
}

async function init() {
	const emailRegExp = /@\w+\.\w+$/;

	if (name && !nameRegExp.test(name)) {
		console.error(`${red('[ERROR]')} The name ${green(name)} does not match ${cyan(String(nameRegExp))}.`);
		process.exit(1);
	}

	name ??= await askName();
	const path = join(process.cwd(), name);
	if (await existsAsync(path)) {
		console.error(`${red('[ERROR]')} The path ${green(path)} already exists, unable to continue.`);
		process.exit(1);
	}

	const questions: prompts.PromptObject<'author' | 'email' | 'description'>[] = [];

	if (!options.author) {
		questions.push({
			type: 'text',
			name: 'author',
			message: 'What is your author name?',
			validate: (value) => !value.includes('<') || 'Please skip the email for the next step'
		});
	}

	if (!options.email && (options.author ? !options.author.includes('<') : true)) {
		questions.push({
			type: 'text',
			name: 'email',
			message: 'What is your email?',
			validate: (value) => value.length === 0 || emailRegExp.test(value) || 'That does not look like an email to me'
		});
	}

	if (!options.description) {
		questions.push({
			type: 'text',
			name: 'description',
			message: "What is your bot's description?"
		});
	}

	const responses = await prompts<'author' | 'email' | 'description'>(questions);

	// If the extension isn't prefixed with a dot, add it:
	if (options.extension && !options.extension.startsWith('.')) {
		options.extension = `.${options.extension}` as FileExtension;
	}

	const resolved = pick({
		name,
		extension: options.extension,
		managers: {
			npm: options.useNpm,
			yarn: options.useYarn,
			pnpm: options.usePnpm
		},
		module: options.module,
		template: options.template
	});

	try {
		const [pkg] = await Promise.all([
			await createPackage(name, resolved.template, {
				author: options.author ?? responses.author,
				email: options.email ?? responses.email,
				description: options.description ?? responses.description
			}),
			await createTree(path, resolved.template.files, resolved.replacerOptions)
		]);
		await writeFile(join(path, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8');
		await install(path, resolved.packageManager);
	} catch (error) {
		console.error(`${red('[ERROR]')} An unexpected error occurred:`, error);
		process.exit(1);
	}
}

void init();

interface Options {
	verbose?: true;
	template?: TemplateType;
	module?: ModuleType;
	extension?: FileExtension;
	author?: string;
	email?: string;
	description?: string;
	useNpm?: true;
	useYarn?: true;
	usePnpm?: true;
}
