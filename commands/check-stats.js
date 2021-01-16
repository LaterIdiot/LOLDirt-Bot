const { hypixelAPIKey } = require("../index");
const { findPlayerData } = require("../helpers/playerData");
const Discord = require("discord.js");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);

module.exports = {
	name: "check-stats",
	description:
		"Checks your stats to see if you meet minimum requirements to get into our guild.",
	args: true,
	usage: "<username>",
	guildOnly: false,
	cooldown: 5,
	async execute(message, args) {
		let loadingEmbed = new Discord.MessageEmbed({
			color: "#488bf7",
			title: "Loading...",
			description: "Loading player stats.",
		});

		const sentMsg = await message.channel.send(loadingEmbed);

		const playerData = await findPlayerData(args.shift());

		if (!playerData) {
			const playerError = new Discord.MessageEmbed({
				color: "#ff0000",
				title: "Error:",
				description: "Player does not exist.",
			});

			return sentMsg.edit(playerError);
		}

		const player = await hypixel.player.uuid(playerData.id);

		if (!player) {
			const playerError = new Discord.MessageEmbed({
				color: "#ff0000",
				title: "Error",
				description: "Player does not exist on Hypixel Network.",
			});

			return sentMsg.edit(playerError);
		}

		function findSkywarsLevel(xp) {
			const xps = [
				0,
				20,
				70,
				150,
				250,
				500,
				1000,
				2000,
				3500,
				6000,
				10000,
				15000,
			];

			if (xp >= 15000) {
				return ((xp - 15000) / 10000 + 12).toFixed();
			} else {
				for (let i = 0; i < xps.length; i++) {
					if (xp < xps[i]) {
						return i;
					}
				}
			}
		}

		function objectiveMet(objective, goal) {
			return objective >= goal ? "✔ " : "❌";
		}

		const requirement = {
			basic: {
				networkLevel: 125,
				bedwarsLevel: 70,
				bedwarsFKDR: 1.5,
				skywarsLevel: 5,
				skywarsKDR: 1,
				duelsWins: 700,
				achievementPoints: 7000,
			},
			major: {
				bedwars: {
					level: 175,
					FKDR: 2,
				},
				skywars: {
					level: 12,
					wins: 1200,
					KDR: 2,
				},
				skyblock: {
					slayersXp: 250000,
					skillAverage: 20,
				},
				duels: {
					wins: 5000,
					WLR: 5,
					kills: 4000,
				},
				UHC: {
					wins: 40,
					KDR: 2,
				},
				blitz: {
					wins: 150,
					kills: 3000,
				},
				tnt: {
					wins: 500,
				},
				buildBattle: {
					score: 15000,
				},
				classic: {
					wins: 150,
				},
				arcade: {
					wins: 1000,
				},
				copsAndCrims: {
					wins: 500,
					kills: 1000,
				},
				murderMystery: {
					wins: 1000,
					kills: 1500,
				},
				hypixelNetwork: {
					level: 250,
					achievementPoints: 15000,
					karma: 10000000,
				},
				pit: {
					prestige: 5,
				},
			},
		};

		const networkExp = player.networkExp || 0;
		const bedwarsFinalKills = player.stats
			? player.stats.Bedwars
				? player.stats.Bedwars.final_kills_bedwars || 0
				: 0
			: 0;
		const bedwarsFinalDeaths = player.stats
			? player.stats.Bedwars
				? player.stats.Bedwars.final_deaths_bedwars || 0
				: 0
			: 0;
		const skywars = player.stats ? player.stats.SkyWars || null : null;
		const skywarsKills =
			(skywars ? skywars.kills_solo || 0 : 0) +
			(skywars ? skywars.kills_team || 0 : 0) +
			(skywars ? skywars.kills_mega || 0 : 0) +
			(skywars ? skywars.kills_mega_doubles || 0 : 0);
		const skywarsDeaths =
			(skywars ? skywars.deaths_solo || 0 : 0) +
			(skywars ? skywars.deaths_team || 0 : 0) +
			(skywars ? skywars.deaths_mega || 0 : 0) +
			(skywars ? skywars.deaths_mega_doubles || 0 : 0);

		let playerStats = {
			basic: {
				networkLevel: Math.floor(Math.sqrt(12.25 + 0.0008 * networkExp) - 2.5),
				bedwarsLevel: player.achievements
					? player.achievements.bedwars_level || 0
					: 0,
				bedwarsFKDR:
					bedwarsFinalKills / bedwarsFinalDeaths
						? (bedwarsFinalKills / bedwarsFinalDeaths).toFixed(2)
						: 0,
				skywarsLevel: skywars
					? skywars.skywars_experience
						? findSkywarsLevel(skywars.skywars_experience)
						: 0
					: 0,
				skywarsKDR:
					skywarsKills / skywarsDeaths
						? (skywarsKills / skywarsDeaths).toFixed(2)
						: 0,
				duelsWins: player.stats
					? player.stats.Duels
						? player.stats.Duels.wins || 0
						: 0
					: 0,
				achievementPoints: player.achievementPoints || 0,
			},
		};

		function skyblock() {
			const skyblockProfilesList = await hypixel.skyblock.profiles.uuid(playerData.id);

			if (!skyblockProfilesList) return { skillAverage: 0, slayersXp: 0 };

			const leveling_xp = {
				1: 50,
				2: 125,
				3: 200,
				4: 300,
				5: 500,
				6: 750,
				7: 1000,
				8: 1500,
				9: 2000,
				10: 3500,
				11: 5000,
				12: 7500,
				13: 10000,
				14: 15000,
				15: 20000,
				16: 30000,
				17: 50000,
				18: 75000,
				19: 100000,
				20: 200000,
				21: 300000,
				22: 400000,
				23: 500000,
				24: 600000,
				25: 700000,
				26: 800000,
				27: 900000,
				28: 1000000,
				29: 1100000,
				30: 1200000,
				31: 1300000,
				32: 1400000,
				33: 1500000,
				34: 1600000,
				35: 1700000,
				36: 1800000,
				37: 1900000,
				38: 2000000,
				39: 2100000,
				40: 2200000,
				41: 2300000,
				42: 2400000,
				43: 2500000,
				44: 2600000,
				45: 2750000,
				46: 2900000,
				47: 3100000,
				48: 3400000,
				49: 3700000,
				50: 4000000,
				51: 4300000,
				52: 4600000,
				53: 4900000,
				54: 5200000,
				55: 5500000,
				56: 5800000,
				57: 6100000,
				58: 6400000,
				59: 6700000,
				60: 7000000,
			};

			function findSkillLevel(xp, skillCap) {
				let level = 1;

				for (; level <= skillCap && xp - leveling_xp[level] >= 0; level++) {
					xp -= leveling_xp[level];
				}

				level--;

				return level;
			};

			let skillAverageList = [];
			let slayersXpList = [];

			for (let x of skyblockProfilesList) {
				const profile = x.members[playerData.id];

				const skills = [
					findSkillLevel(
						profile.experience_skill_farming || 0,
						50 +
							(profile.jacob2
								? profile.jacob2.perks
									? profile.jacob2.perks.farming_level_cap || 0
									: 0
								: 0)
					),
					findSkillLevel(profile.experience_skill_mining || 0, 60),
					findSkillLevel(profile.experience_skill_combat || 0, 50),
					findSkillLevel(profile.experience_skill_foraging || 0, 50),
					findSkillLevel(profile.experience_skill_fishing || 0, 50),
					findSkillLevel(profile.experience_skill_enchanting || 0, 60),
					findSkillLevel(profile.experience_skill_alchemy || 0, 50),
					findSkillLevel(profile.experience_skill_taming || 0, 50),
				];

				const slayers = [
					profile.slayer_bosses ? profile.slayer_bosses.zombie ? profile.slayer_bosses.zombie.xp || 0 : 0 : 0,
					profile.slayer_bosses ? profile.slayer_bosses.spider ? profile.slayer_bosses.spider.xp || 0 : 0 : 0,
					profile.slayer_bosses ? profile.slayer_bosses.wolf ? profile.slayer_bosses.wolf.xp || 0 : 0 : 0
				]

				slayersXpList.push(slayers.reduce((a, b) => a + b, 0));
				skillAverageList.push(skills.reduce((a, b) => a + b, 0) / 8);
			};

			// CONTINUE FROM HERE
			// CONTINUE FROM HERE
			// CONTINUE FROM HERE
		};

		playerStats.major = {
			bedwars: {
				level: playerStats.basic.bedwarsLevel,
				FKDR: playerStats.basic.bedwarsFKDR,
			},
			skywars: {
				level: playerStats.basic.skywarsLevel,
				wins: skywars ? skywars.wins || 0 : 0,
				KDR: playerStats.basic.skywarsKDR,
			},
			skyblock: {},
		};

		let requirementMet = {
			basic: {
				networkLevel: null,
				bedwarsLevel: null,
				bedwarsFKDR: null,
				skywarsLevel: null,
				skywarsKDR: null,
				duelsWins: null,
				achievementPoints: null,
			},
		};

		for (i in requirement.basic) {
			requirementMet.basic[i] = objectiveMet(
				playerStats.basic[i],
				requirement.basic[i]
			);
		}

		const totalRequirementsMet = {
			basic:
				Object.values(requirementMet.basic).indexOf("❌") >= 0 ? "❌" : "✅ ",
		};

		const statCheckEmbed = new Discord.MessageEmbed({
			color: "#32a852",
			title: "Check List:",
			description:
				"This is a checklist which you can view and see what requirements you meet and if you can join our guild or not.",
			fields: [
				{
					name: `${totalRequirementsMet.basic} Basic Requirements:`,
					value: `\`\`\`\n${requirementMet.basic.networkLevel}Hypixel Network Level: ${playerStats.basic.networkLevel}\n${requirementMet.basic.bedwarsLevel}Bedwars Level: ${playerStats.basic.bedwarsLevel}\n${requirementMet.basic.bedwarsFKDR}Bedwars FKDR: ${playerStats.basic.bedwarsFKDR}\n${requirementMet.basic.skywarsLevel}Skywars Level: ${playerStats.basic.skywarsLevel}\n${requirementMet.basic.skywarsKDR}Skywars KDR: ${playerStats.basic.skywarsKDR}\n${requirementMet.basic.duelsWins}Duels Wins: ${playerStats.basic.duelsWins}\n${requirementMet.basic.achievementPoints}Achievement Points: ${playerStats.basic.achievementPoints}\`\`\``,
				},
			],
		});

		await sentMsg.edit(statCheckEmbed);
	},
};
