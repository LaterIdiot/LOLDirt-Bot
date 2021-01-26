const Discord = require("discord.js");
const checkStats = require("./checkStats");
let { questions, color } = require("../../config.json");

module.exports = {
	name: "apply",
	description: "Starts an application to apply for the guild.",
	args: true,
	usage: "<your_minecraft_username>",
	guildOnly: true,
	cooldown: 1000,
	async execute(message, args) {
		try {
			let loadingEmbed = new Discord.MessageEmbed({
				color: color.blue,
				title: "Loading...",
				description: "Loading player stats!",
			});

			const botMsg = await message.author.send(message.author, loadingEmbed);

			const sentSuccessEmbed = new Discord.MessageEmbed({
				color: color.green,
				title: "Success!",
				description:
					"You have successfully started your application check your DM's!",
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			await message.channel.send(message.author, sentSuccessEmbed);

			const {
				playerData,
				basicResultStr,
				majorResultStr,
				minorResultStr,
				totalRequirementsMet,
			} = await checkStats.command(message, botMsg, args);

			if (!playerData) {
				const errorEmbed = new Discord.MessageEmbed({
					color: color.red,
					title: "Failure!",
					description: "Couldn't access player stats try again later!",
					timestamp: new Date(),
					footer: {
						text: message.author.username,
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
				});

				return message.author.send(message.author, errorEmbed);
			}

			let answers = [];

			let questionEmbed = new Discord.MessageEmbed({
				color: color.yellow,
				title: "Queston!",
				description: null,
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			for (let x of questions) {
				questionEmbed.description = x.question;

				await message.author.send(message.author, questionEmbed);
				const wait = await message.author.dmChannel
					.awaitMessages((m) => m.author.id === message.author.id, {
						max: 1,
						time: x.cooldown * 1000,
						errors: ["time"],
					})
					.then((collected) => {
						answers.push({
							question: x.question,
							answer: collected.first().content,
						});
						return false;
					})
					.catch(() => {
						message.author.send(`${message.author}, Timed Out`);
						return true;
					});

				if (wait) return;
			}

			let formStr = "";

			for (let i of answers) {
				formStr += `Q: ${i.question}\nA: ${i.answer}\n\n`;
			}

			let application = new Discord.MessageEmbed({
				color: color.purple,
				title: `Applicant - ${playerData.name}`,
				description: `Discord: ${message.author}`,
				fields: [
					{
						name: `${totalRequirementsMet.basic} Basic Requirements:`,
						value: `\`\`\`\n${basicResultStr}\`\`\``,
					},
					{
						name: `${totalRequirementsMet.major} Major Requirements:`,
						value: `\`\`\`\n${
							majorResultStr ? majorResultStr : "No gamemode requirement met."
						}\`\`\``,
					},
					{
						name: `${totalRequirementsMet.minor} Minor Requirements:`,
						value: `\`\`\`\n${
							minorResultStr ? minorResultStr : "No requirement met."
						}\`\`\``,
					},
					{
						name: `Form:`,
						value: `\`\`\`\n${formStr}\`\`\``,
					},
				],
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			await message.guild.channels.cache
				.find((i) => i.name === "ℹ-guild-application-log")
				.send(application);

			const successEmbed = new Discord.MessageEmbed({
				color: color.green,
				title: "Success!",
				description: "Your application has been submitted successfuly!",
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			return message.author.send(message.author, successEmbed);
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
	},
};
