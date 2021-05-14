import type { Template } from '../lib/shared';
import { Directory } from '../lib/tree/Directory';

export const template: Template = {
	main: 'dist/{name}.js',
	scripts: {
		lint: 'eslint src --ext ts --fix',
		format: 'prettier --write "src/**/*.ts"',
		build: 'tsc -b src',
		clean: 'tsc -b src --clean',
		watch: 'tsc -b src -w'
	},
	dependencies: ['discord.js', '@sapphire/framework', '@sapphire/decorators', '@sapphire/plugin-logger'],
	devDependencies: ['@sapphire/eslint-config', '@sapphire/prettier-config', '@sapphire/ts-config', '@types/node', '@types/ws', 'typescript'],
	files: new Directory(':root-typescript')
		.add('.gitignore', [
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
		]) // .gitignore
		.add('tsconfig.base.json', ['{', '	"extends": "@sapphire/ts-config"', '}'])
		.add('tsconfig.eslint.json', ['{', '	"extends": "./tsconfig.base.json",', '	"include": ["src"]', '}'])
		.add(
			'src',
			(src) =>
				src
					.add(
						'commands',
						(commands) =>
							commands.add(
								'General',
								(general) =>
									general.add('ping.ts', [
										"import { ApplyOptions } from '@sapphire/decorators';",
										"import type { Message } from 'discord.js';",
										"import { Command, CommandOptions } from '@sapphire/framework';",
										'',
										'@ApplyOptions<CommandOptions>({',
										"	aliases: ['pong']",
										'})',
										'export class UserCommand extends Command {',
										'	public async run(message: Message, args: Command.Args) {',
										"		const msg = await message.channel.send('Ping...');",
										// eslint-disable-next-line no-template-curly-in-string
										'		return message.send(`Pong! Took: ${msg.createdTimestamp - message.createdTimestamp}ms!`);',
										'	}',
										'}',
										''
									]) // src/commands/General/ping.ts
							) // src/commands/General
					) // src/commands
					.add(
						'events',
						(events) =>
							events.add('mentionPrefixOnly.ts', [
								"import { Event, Events } from '@sapphire/framework';",
								"import type { Message } from 'discord.js';",
								'',
								'export class UserEvent extends Event<Events.MentionPrefixOnly> {',
								'	public async run(message: Message) {',
								"		const prefix = '$';",
								// eslint-disable-next-line no-template-curly-in-string
								"		return message.channel.send(prefix ? `My prefix in this guild is: \\`${prefix}\\`` : 'You do not need a prefix in DMs.');",
								'	}',
								'}',
								''
							]) // src/events/mentionPrefixOnly.ts
					) // src/events
					.add('{name}.ts', [
						"import { LogLevel, SapphireClient } from '@sapphire/framework';",
						"import '@sapphire/plugin-logger/register';",
						"import { BOT_TOKEN } from './config{import-extension}';",
						'',
						'const client = new SapphireClient({',
						"	defaultPrefix: '$',",
						'	caseInsensitiveCommands: true,',
						'	logger: {',
						'		level: LogLevel.Trace',
						'	},',
						"	shards: 'auto',",
						'	ws: {',
						'		intents: [',
						"			'GUILDS',",
						"			'GUILD_BANS',",
						"			'GUILD_EMOJIS',",
						"			'GUILD_VOICE_STATES',",
						"			'GUILD_MESSAGES',",
						"			'GUILD_MESSAGE_REACTIONS',",
						"			'DIRECT_MESSAGES',",
						"			'DIRECT_MESSAGE_REACTIONS'",
						'		]',
						'	}',
						'});',
						'',
						'async function main() {',
						'	try {',
						"		client.logger.info('Logging in');",
						'		await client.login(BOT_TOKEN);',
						"		client.logger.info('Logged in');",
						'	} catch (error) {',
						'		client.logger.fatal(error);',
						'		client.destroy();',
						'		process.exit(1);',
						'	}',
						'};',
						'',
						'main();'
					]) // src/{name}.ts
					.add('config.example.ts', "export const BOT_TOKEN = '';")
					.add('tsconfig.json', [
						'{',
						'	"extends": "../tsconfig.base.json",',
						'	"compilerOptions": {',
						'		"rootDir": "./",',
						'		"outDir": "../dist",',
						'		"composite": true',
						'	},',
						'	"include": ["."]',
						'}'
					]) // src/tsconfig.json
		) // src
};
