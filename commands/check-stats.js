const { hypixelAPIKey } = require("../index");
const Discord = require("discord.js");
const Hypixel = require('hypixel-api-reborn');
const hypixel = new Hypixel.Client(hypixelAPIKey);

module.exports = {
	name: 'check-stats',
	description: 'Checks your stats to see if you meet minimum requirements to get into our guild.',
	args: true,
	usage: '<username>',
	guildOnly: false,
	cooldown: 5,
	async execute(message, args) {
		const player = await hypixel.getPlayer(args.shift())
			.catch(() => {
				const playerError = new Discord.MessageEmbed()
					.setColor("#ff0000")
					.setTitle("Error:")
					.setDescription("Player does not exist.");

				message.channel.send(playerError);
			});

		let loadingEmbed = new Discord.MessageEmbed()
			.setColor("#ff0000");

		const sentMsg = await message.channel.send(loadingEmbed);

	}
};