const fs = require("fs");
const Discord = require("discord.js");
const { prefix } = require("../index");
const { color } = require("../config.json");
const { title } = require("process");

module.exports = {
	name: "help",
	description: "List's all of my commands or info about a specific command.",
	aliases: ["commands"],
	usage: "[command name]",
	cooldown: 5,
	async execute(message, args) {
		const { commands } = message.client;

		if (!args.length) {
			const dataEmbed = new Discord.MessageEmbed({
				color: color.blue,
				title: "Here's all of my commands!",
				description: `\nYou can send \`${prefix}help [command name | aliases]\` to get info on a specific command!`,
				fields: [],
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			const commandFolders = fs
				.readdirSync("./commands")
				.filter((folder) => !folder.endsWith(".js"));

			for (const folder of commandFolders) {
				const i = commandFolders.indexOf(folder);
				const commandFiles = fs
					.readdirSync(`./commands/${folder}`)
					.filter((file) => file.endsWith(".js"));

				dataEmbed.fields.push({
					name: `${folder} [${commandFiles.length}] -`,
					value: "",
				});

				for (const file of commandFiles) {
					dataEmbed.fields[i].value += `\`${file
						.toLowerCase()
						.slice(0, -3)}\` `;
				}
			}

			try {
				await message.author.send(message.author, dataEmbed);

				if (message.channel.type === "dm") return;

				const successEmbed = new Discord.MessageEmbed({
					color: color.green,
					title: "Success!",
					description: "I've sent you a DM with a list of all my commands!",
					timestamp: new Date(),
					footer: {
						text: message.author.username,
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
				});

				return message.channel.send(message.author, successEmbed);
			} catch (error) {
				const failureEmbed = new Discord.MessageEmbed({
					color: color.red,
					title: "Failure!",
					description:
						"It seems like I can't DM you! You might have `Allow direct messages from server members.` disabled in the server `Privacy Settings`!",
					timestamp: new Date(),
					footer: {
						text: message.author.username,
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
				});

				return message.channel.send(message.author, failureEmbed);
			}
		}

		const name = args[0].toLowerCase();
		const command =
			commands.get(name) ||
			commands.find((c) => c.aliases && c.aliases.includes(name));

		if (!command) {
			const invalidCmdEmbed = new Discord.MessageEmbed({
				color: color.red,
				title: "Invalid Command!",
				description: "Try `dirt.help` to see a list of all of my commands!",
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			return message.channel.send(message.author, invalidCmdEmbed);
		}

		let dataEmbed = new Discord.MessageEmbed({
			color: color.blue,
			title: `Command - \`${command.name}\``,
			description: "",
			timestamp: new Date(),
			footer: {
				text: message.author.username,
				icon_url: message.author.avatarURL({ dynamic: true }),
			},
		});

		if (command.aliases)
			dataEmbed.description += `**Aliases:** ${command.aliases
				.map((i) => `\`${i}\``)
				.join(", ")}\n`;
		if (command.description)
			dataEmbed.description += `**Description:** ${command.description}\n`;
		if (command.usage)
			dataEmbed.description += `**Usage:** \`${prefix}${command.name} ${command.usage}\`\n`;
		dataEmbed.description += `**Cooldown:** ${
			command.cooldown || 3
		} second(s)\n`;
		if (command.permission)
			dataEmbed.description += `**Permission** ${command.permission}`

		message.channel.send(message.author, dataEmbed);
	},
};
