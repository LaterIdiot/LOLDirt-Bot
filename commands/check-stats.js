const { hypixelAPIKey } = require("../index");
const { findPlayerData } = require("../helpers/playerData");
const Discord = require("discord.js");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);

module.exports = {
	name: 'check-stats',
	description: 'Checks your stats to see if you meet minimum requirements to get into our guild.',
	args: true,
	usage: '<username>',
	guildOnly: false,
	cooldown: 5,
	async execute(message, args) {
		let loadingEmbed = new Discord.MessageEmbed({
			color: "#488bf7",
			title: "Loading...",
			description: "Loading player stats."
		});

		const sentMsg = await message.channel.send(loadingEmbed);

		const playerData = await findPlayerData(args.shift())

		if (!playerData) {
			const playerError = new Discord.MessageEmbed({
				color: "#ff0000",
				title: "Error:",
				description: "Player does not exist."
			});

			return sentMsg.edit(playerError);
		};

		const player = await hypixel.player.uuid(playerData.id);

		if (!player) {
			const playerError = new Discord.MessageEmbed({
				color: "#ff0000",
				title: "Error",
				description: "Player does not exist on Hypixel Network."
			});

			return sentMsg.edit(playerError);
		}

		function findSkywarsLevel(xp) {
			const xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];

			if (xp >= 15000) {
				return ((xp - 15000) / 10000 + 12).toFixed();
			} else {
				for (let i = 0; i < xps.length; i++) {
					if (xp < xps[i]) {
						return i;
					};
				};
			};
		};

		function objectiveMet(objective, goal) {
			return objective >= goal ? "✔ " : "❌";
		};

		const requirement = {
			basic: {
				networkLevel: 125,
				bedwarsLevel: 70,
				bedwarsFKDR: 1.5,
				skywarsLevel: 5,
				skywarsKDR: 1,
				duelsWins: 700,
				achievementPoints: 7000
			}
		};

		const networkExp = player.networkExp || 0;
		const bedwarsFinalKills = player.stats ? player.stats.Bedwars ? player.stats.Bedwars.final_kills_bedwars || 0 : 0 : 0;
		const bedwarsFinalDeaths = player.stats ? player.stats.Bedwars ? player.stats.Bedwars.final_deaths_bedwars || 0 : 0 : 0;
		const skywars = player.stats ? player.stats.SkyWars || null : null;
		const skywarsKills = (skywars ? skywars.kills_solo || 0 : 0) + (skywars ? skywars.kills_team || 0 : 0) + (skywars ? skywars.kills_mega || 0 : 0) + (skywars ? skywars.kills_mega_doubles || 0 : 0);
		const skywarsDeaths = (skywars ? skywars.deaths_solo || 0 : 0) + (skywars ? skywars.deaths_team || 0 : 0) + (skywars ? skywars.deaths_mega || 0 : 0) + (skywars ? skywars.deaths_mega_doubles || 0 : 0);

		const playerStats = {
			basic: {
				networkLevel: Math.floor(Math.sqrt(12.25 + 0.0008 * networkExp) - 2.5),
				bedwarsLevel: player.achievements ? player.achievements.bedwars_level || 0 : 0,
				bedwarsFKDR: bedwarsFinalKills / bedwarsFinalDeaths ? (bedwarsFinalKills / bedwarsFinalDeaths).toFixed(2) : 0,
				skywarsLevel: skywars ? skywars.skywars_experience ? findSkywarsLevel(skywars.skywars_experience) : 0 : 0,
				skywarsKDR: skywarsKills / skywarsDeaths ? (skywarsKills / skywarsDeaths).toFixed(2) : 0,
				duelsWins: player.stats ? player.stats.Duels ? player.stats.Duels.wins || 0 : 0 : 0,
				achievementPoints: player.achievementPoints || 0
			}
		}

		let requirementMet = {
			basic: {
				networkLevel: null,
				bedwarsLevel: null,
				bedwarsFKDR: null,
				skywarsLevel: null,
				skywarsKDR: null,
				duelsWins: null,
				achievementPoints: null
			}
		};

		for (i in requirement.basic) {
			requirementMet.basic[i] = objectiveMet(playerStats.basic[i], requirement.basic[i]);
		};

		const totalRequirementsMet = {
			basic: Object.values(requirementMet.basic).indexOf("❌") >= 0 ? "❌" : "✅ "
		}

		const statCheckEmbed = new Discord.MessageEmbed({
			color: "#32a852",
			title: "Check List:",
			description: "This is a checklist which you can view and see what requirements you meet and if you can join our guild or not.",
			fields: [
				{
					name: `${totalRequirementsMet.basic} Basic Requirements:`,
					value: `\`\`\`\n${requirementMet.basic.networkLevel}Hypixel Network Level: ${playerStats.basic.networkLevel}\n${requirementMet.basic.bedwarsLevel}Bedwars Level: ${playerStats.basic.bedwarsLevel}\n${requirementMet.basic.bedwarsFKDR}Bedwars FKDR: ${playerStats.basic.bedwarsFKDR}\n${requirementMet.basic.skywarsLevel}Skywars Level: ${playerStats.basic.skywarsLevel}\n${requirementMet.basic.skywarsKDR}Skywars KDR: ${playerStats.basic.skywarsKDR}\n${requirementMet.basic.duelsWins}Duels Wins: ${playerStats.basic.duelsWins}\n${requirementMet.basic.achievementPoints}Achievement Points: ${playerStats.basic.achievementPoints}\`\`\``
				}
			]
		});

		await sentMsg.edit(statCheckEmbed);
	}
};