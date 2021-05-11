import type { Template } from '../lib/shared';
import { Directory } from '../lib/tree/Directory';

export const template: Template = {
	main: 'src/{name}.js',
	scripts: {
		lint: 'eslint src --ext js,mjs --fix',
		format: 'prettier --write "src/**/*.js"'
	},
	dependencies: ['discord.js', '@sapphire/framework', '@sapphire/plugin-logger'],
	devDependencies: ['@sapphire/eslint-config', '@sapphire/prettier-config', '@sapphire/ts-config'],
	files: new Directory(':root-javascript')
		.add('.gitignore', [
			'# Ignore a blackhole and the folder for development',
			'node_modules/',
			'.vs/',
			'.idea/',
			'*.iml',
			'',
			'# Environment variables',
			'.DS_Store',
			'.env',
			'',
			'# Ignore the config file (contains sensitive information such as tokens)',
			'config{file-extension}',
			'',
			'# Ignore heapsnapshot and log files',
			'*.heapsnapshot',
			'*.log',
			'',
			'# Ignore package locks',
			'{ignored-package-locks}'
		]) // .gitignore
		.add('tsconfig.eslint.json', ['{', '	"extends": "@sapphire/ts-config",', '	"include": ["src"]', '}'])
		.add('src', (src) =>
			src
				.add(
					'commands',
					(commands) =>
						commands.add(
							'General',
							(general) =>
								general.add('ping{file-extension}', [
									'{import:@sapphire/framework, Command};',
									'',
									'{export} class UserCommand extends Command {',
									'	constructor(context) {',
									"		super(context, { aliases: ['pong'] });",
									'	}',
									'',
									'	async run(message, args) {',
									"		const msg = await message.channel.send('Ping...');",
									// eslint-disable-next-line no-template-curly-in-string
									'		return message.send(`Pong! Took: ${msg.createdTimestamp - message.createdTimestamp}ms!`);',
									'	}',
									'};'
								]) // src/commands/General/ping{file-extension}
						) // src/commands/General
				) // src/commands
				.add(
					'events',
					(events) =>
						events.add('mentionPrefixOnly{file-extension}', [
							'{import:@sapphire/framework, Event};',
							'',
							'{export} class UserEvent extends Event {',
							'	async run(message) {',
							"		const prefix = '$';",
							// eslint-disable-next-line no-template-curly-in-string
							"		return message.channel.send(prefix ? `My prefix in this guild is: `${prefix}`` : 'You do not need a prefix in DMs.');",
							'	}',
							'};'
						]) // src/events/mentionPrefixOnly{file-extension}
				) // src/events
				.add('{name}{file-extension}', [
					'{import:@sapphire/framework, LogLevel SapphireClient};',
					'{import:@sapphire/plugin-logger/register}',
					'{import:./config, BOT_TOKEN}',
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
					'main();',
					''
				]) // src/{name}{file-extension}
				.add('config.example{file-extension}', "{export:BOT_TOKEN} '';")
		) // src
};
