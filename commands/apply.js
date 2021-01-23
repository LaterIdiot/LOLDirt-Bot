
const { findPlayerData } = require("../helpers/playerData");
const Discord = require("discord.js");
const checkStats = require("./check-stats")

module.exports = {
	name: "apply",
	description:
		"Starts an application to apply for the guild.",
	args: true,
	usage: "<username>",
	guildOnly: true,
	cooldown: 5,
	async execute(message, args) {
		let loadingEmbed = new Discord.MessageEmbed({
			color: "#488bf7",
			title: "Loading...",
			description: "Loading player stats.",
		});

		const botMsg = await message.author.send(message.author, loadingEmbed);

		checkStats.command(message, botMsg, args);
	},
};