import { template as JavaScriptTemplate } from '../templates/javascript';
import { template as TypeScriptTemplate } from '../templates/typescript';
import { CommonJsReplacer } from './replacers/CommonJsReplacer';
import { ESModuleReplacer } from './replacers/ESModuleReplacer';
import type { ReplacerOptions } from './replacers/VariableReplacer';
import type { Directory } from './tree/Directory';

export interface Template {
	main: string;
	scripts: Record<string, string>;
	dependencies: readonly string[];
	devDependencies: readonly string[];
	files: Directory;
}

export type TypeScriptTemplateType = 'ts' | 'typescript';
export type JavaScriptTemplateType = 'js' | 'javascript';
export type TemplateType = TypeScriptTemplateType | JavaScriptTemplateType;

export type CommonJsModuleType = 'cjs' | 'commonjs' | 'script';
export type ESModuleModuleType = 'esm' | 'ecmascript' | 'es6' | 'esnext' | 'module';
export type ModuleType = CommonJsModuleType | ESModuleModuleType;

export type FileExtension = '.ts' | '.js' | '.cjs' | '.mjs';
export type ImportExtension = '' | FileExtension;

export interface TemplatePickPackageManagerOptions {
	npm?: true;
	yarn?: true;
	pnpm?: true;
}
export type PackageManager = 'npm' | 'yarn' | 'pnpm';

export interface TemplatePickOptions {
	name: string;
	template?: TemplateType;
	module?: ModuleType;
	extension?: FileExtension;
	managers?: TemplatePickPackageManagerOptions;
}

export function shouldUseTypeScript(template?: TemplateType) {
	switch (template) {
		case 'ts':
		case 'typescript':
			return true;
		default:
			return false;
	}
}

export function shouldUseCommonJS(mod?: ModuleType) {
	switch (mod) {
		case undefined:
		case 'cjs':
		case 'commonjs':
		case 'script':
			return true;
		default:
			return false;
	}
}

export function getPackageManagerFromArgv(): PackageManager | null {
	const arg = process.argv0;
	if (arg.includes('pnpm')) return 'pnpm';
	if (arg.includes('yarn')) return 'yarn';
	if (arg.includes('npm') || arg.includes('npx')) return 'npm';
	return null;
}

export function getPackageManager(options: TemplatePickPackageManagerOptions = {}): PackageManager {
	const npm = options.npm ? 'npm' : null;
	const yarn = options.yarn ? 'yarn' : null;
	const pnpm = options.pnpm ? 'pnpm' : null;

	return npm ?? yarn ?? pnpm ?? getPackageManagerFromArgv() ?? 'npm';
}

export function getPackageManagerVendorFiles(manager: PackageManager): readonly string[] {
	switch (manager) {
		case 'npm':
			return ['package-lock.json', 'npm-shrinkwrap.json', 'npm-debug.log'];
		case 'yarn':
			return ['yarn.lock', 'yarn-error.log', 'yarn-debug.log'];
		case 'pnpm':
			return ['pnpm-lock.yaml'];
	}
}

export function getOppositePackageManagerLocks(manager: PackageManager): readonly string[] {
	switch (manager) {
		case 'npm':
			return [...getPackageManagerVendorFiles('yarn'), ...getPackageManagerVendorFiles('pnpm')];
		case 'yarn':
			return [...getPackageManagerVendorFiles('npm'), ...getPackageManagerVendorFiles('pnpm')];
		case 'pnpm':
			return [...getPackageManagerVendorFiles('npm'), ...getPackageManagerVendorFiles('yarn')];
	}
}

export interface ResolvedOptions {
	template: Template;
	packageManager: PackageManager;
	replacerOptions: ReplacerOptions;
}

export function pick(options: TemplatePickOptions): ResolvedOptions {
	const ts = shouldUseTypeScript(options.template);
	const cjs = shouldUseCommonJS(options.module);
	const extension = options.extension ?? (cjs ? '.js' : ts ? '.js' : '.mjs');

	const template = ts ? TypeScriptTemplate : JavaScriptTemplate;
	const packageManager = getPackageManager(options.managers);
	const replacerOptions: ReplacerOptions = {
		name: options.name,
		ignoredPackageLocks: getOppositePackageManagerLocks(packageManager),
		fileExtension: ts ? '.ts' : extension,
		importExtension: cjs ? '' : extension,
		replacer: cjs ? new CommonJsReplacer() : new ESModuleReplacer()
	};

	return { template, packageManager, replacerOptions };
}
