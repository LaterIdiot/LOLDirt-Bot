const { hypixelAPIKey } = require("../../index");
const { findPlayerData } = require("../../helpers/playerData");
const { requirement, color } = require("../../config.json");
const Discord = require("discord.js");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);

// finds skywars level
function findSkywarsLevel(xp) {
	const xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];

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

function sb(skyblockProfilesList, playerData) {
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
	}

	let skillAverageList = [];
	let slayersXpList = [];

	for (let x of skyblockProfilesList) {
		const profile = x.members[playerData.id];

		let skills = [
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

		let slayers = [
			profile.slayer_bosses
				? profile.slayer_bosses.zombie
					? profile.slayer_bosses.zombie.xp || 0
					: 0
				: 0,
			profile.slayer_bosses
				? profile.slayer_bosses.spider
					? profile.slayer_bosses.spider.xp || 0
					: 0
				: 0,
			profile.slayer_bosses
				? profile.slayer_bosses.wolf
					? profile.slayer_bosses.wolf.xp || 0
					: 0
				: 0,
		];

		slayersXpList.push(slayers.reduce((a, b) => a + b, 0));
		skillAverageList.push(skills.reduce((a, b) => a + b, 0) / 8);
	}

	const skillAverage = Math.max(...skillAverageList);
	const slayersXp = Math.max(...slayersXpList);

	return { skillAverage, slayersXp };
}

async function command(message, sentMsg, args) {
	const playerData = await findPlayerData(args.shift());

	if (!playerData || !playerData.id || !playerData.name) {
		const playerError = new Discord.MessageEmbed({
			color: color.red,
			title: "Failure!",
			description: "Player does not exist!",
			timestamp: new Date(),
			footer: {
				text: message.author.username,
				icon_url: message.author.avatarURL({ dynamic: true }),
			},
		});

		return sentMsg.edit(playerError);
	}

	const player = await hypixel.player
		.uuid(playerData.id)
		.catch((err) => console.error(err));

	if (!player) {
		const playerError = new Discord.MessageEmbed({
			color: color.red,
			title: "Failure!",
			description: "Player does not exist on the Hypixel Network!",
			timestamp: new Date(),
			footer: {
				text: message.author.username,
				icon_url: message.author.avatarURL({ dynamic: true }),
			},
		});

		return sentMsg.edit(playerError);
	}

	function objectiveMet(objective, goal) {
		return objective >= goal ? "✔ " : "❌";
	}

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
			bedwarsFKDR: ![Infinity, NaN, 0].includes(
				bedwarsFinalKills / bedwarsFinalDeaths
			)
				? Number((bedwarsFinalKills / bedwarsFinalDeaths).toFixed(2))
				: 0,
			skywarsLevel: skywars
				? skywars.skywars_experience
					? Number(findSkywarsLevel(skywars.skywars_experience))
					: 0
				: 0,
			skywarsKDR: ![Infinity, NaN, 0].includes(skywarsKills / skywarsDeaths)
				? Number((skywarsKills / skywarsDeaths).toFixed(2))
				: 0,
			duelsWins: player.stats
				? player.stats.Duels
					? player.stats.Duels.wins || 0
					: 0
				: 0,
			achievementPoints: player.achievementPoints || 0,
		},
	};

	const skyblockProfilesList = await hypixel.skyblock.profiles
		.uuid(playerData.id)
		.catch(() => {
			return null;
		});

	const skyblock = sb(skyblockProfilesList, playerData);

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
		skyblock: {
			slayersXp: skyblock.slayersXp,
			skillAverage: skyblock.skillAverage,
		},
		duels: {
			wins: player.stats
				? player.stats.Duels
					? player.stats.Duels.wins || 0
					: 0
				: 0,
			WLR: player.stats
				? player.stats.Duels
					? ![Infinity, NaN, 0].includes(
							(player.stats.Duels.wins || 0) / (player.stats.Duels.losses || 0)
					  )
						? Number(
								(
									(player.stats.Duels.wins || 0) /
									(player.stats.Duels.losses || 0)
								).toFixed(2)
						  )
						: 0
					: 0
				: 0,
			kills: player.stats
				? player.stats.Duels
					? player.stats.Duels.kills || 0
					: 0
				: 0,
		},
		UHC: {
			wins: player.stats
				? player.stats.UHC
					? player.stats.UHC.wins || 0
					: 0
				: 0,
			KDR: player.stats
				? player.stats.UHC
					? ![Infinity, NaN, 0].includes(
							(player.stats.UHC.kills || 0) / (player.stats.UHC.deaths || 0)
					  )
						? (player.stats.UHC.kills || 0) / (player.stats.UHC.deaths || 0)
						: 0
					: 0
				: 0,
		},
		blitz: {
			wins: player.stats
				? player.stats.HungerGames
					? player.stats.HungerGames.wins || 0
					: 0
				: 0,
			kills: player.stats
				? player.stats.HungerGames
					? player.stats.HungerGames.kills || 0
					: 0
				: 0,
		},
		tnt: {
			wins: player.stats
				? player.stats.TNTGames
					? player.stats.TNTGames.wins || 0
					: 0
				: 0,
		},
		buildBattle: {
			score: player.stats
				? player.stats.BuildBattle
					? player.stats.BuildBattle.score || 0
					: 0
				: 0,
		},
		classic: {
			wins: player.stats
				? (player.stats.VampireZ
						? (player.stats.VampireZ.human_wins || 0) +
						  (player.stats.VampireZ.vampire_wins || 0)
						: 0) +
				  (player.stats.Quake ? player.stats.Quake.wins || 0 : 0) +
				  (player.stats.Paintball ? player.stats.Paintball.wins || 0 : 0) +
				  (player.stats.Arena ? player.stats.Arena.wins || 0 : 0) +
				  (player.stats.Walls ? player.stats.Walls.wins || 0 : 0) +
				  (player.stats.GingerBread ? player.stats.GingerBread.wins || 0 : 0)
				: 0,
		},
		arcade: {
			wins: player.stats
				? player.stats.Arcade
					? (player.stats.Arcade.wins_dayone || 0) +
					  (player.stats.Arcade.wins_dragonwars2 || 0) +
					  (player.stats.Arcade.wins_ender || 0) +
					  (player.stats.Arcade.wins_farm_hunt || 0) +
					  (player.stats.Arcade.wins_oneinthequiver || 0) +
					  (player.stats.Arcade.wins_party || 0) +
					  (player.stats.Arcade.wins_party_2 || 0) +
					  (player.stats.Arcade.wins_party_3 || 0) +
					  (player.stats.Arcade.wins_throw_out || 0) +
					  (player.stats.Arcade.wins_hole_in_the_wall || 0) +
					  (player.stats.Arcade.wins_simon_says || 0) +
					  (player.stats.Arcade.wins_mini_walls || 0) +
					  (player.stats.Arcade.seeker_wins_hide_and_seek || 0) +
					  (player.stats.Arcade.hider_wins_hide_and_seek || 0) +
					  (player.stats.Arcade.party_pooper_seeker_wins_hide_and_seek || 0) +
					  (player.stats.Arcade.party_pooper_hider_wins_hide_and_seek || 0) +
					  (player.stats.Arcade.wins_zombies || 0)
					: 0
				: 0,
		},
		copsAndCrims: {
			wins: player.stats
				? player.stats.MCGO
					? player.stats.MCGO.game_wins || 0
					: 0
				: 0,
			kills: player.stats
				? player.stats.MCGO
					? (player.stats.MCGO.kills || 0) +
					  (player.stats.MCGO.kills_deathmatch || 0)
					: 0
				: 0,
		},
		murderMystery: {
			wins: player.stats
				? player.stats.MurderMystery
					? player.stats.MurderMystery.wins || 0
					: 0
				: 0,
			kills: player.stats
				? player.stats.MurderMystery
					? player.stats.MurderMystery.kills || 0
					: 0
				: 0,
		},
		hypixelNetwork: {
			level: playerStats.basic.networkLevel,
			achievementPoints: playerStats.basic.achievementPoints,
			karma: player.karma || 0,
		},
		pit: {
			prestige: player.stats
				? player.stats.Pit
					? player.stats.Pit.profile
						? player.stats.Pit.profile.prestiges
							? player.stats.Pit.profile.prestiges.length || 0
							: 0
						: 0
					: 0
				: 0,
		},
	};

	playerStats.minor = {
		bedwarsFKDR: playerStats.basic.bedwarsFKDR,
		bedwarsWins: player.stats
			? player.stats.Bedwars
				? player.stats.Bedwars.wins_bedwars || 0
				: 0
			: 0,
		bedwarsBBLR: player.stats
			? player.stats.Bedwars
				? ![Infinity, NaN, 0].includes(
						(player.stats.Bedwars.beds_broken_bedwars || 0) /
							(player.stats.Bedwars.beds_lost_bedwars || 0)
				  )
					? Number(
							(
								(player.stats.Bedwars.beds_broken_bedwars || 0) /
								(player.stats.Bedwars.beds_lost_bedwars || 0)
							).toFixed(2)
					  )
					: 0
				: 0
			: 0,
		bedwarsWLR: player.stats
			? player.stats.Bedwars
				? ![Infinity, NaN, 0].includes(
						(player.stats.Bedwars.wins_bedwars || 0) /
							(player.stats.Bedwars.losses_bedwars || 0)
				  )
					? Number(
							(
								(player.stats.Bedwars.wins_bedwars || 0) /
								(player.stats.Bedwars.losses_bedwars || 0)
							).toFixed(2)
					  )
					: 0
				: 0
			: 0,
		bedwarsLevel: playerStats.basic.bedwarsLevel,
		skywarsKDR: playerStats.basic.skywarsKDR,
		skywarsWins: playerStats.major.skywars.wins,
		skywarsKills: skywarsKills,
		skywarsWLR: skywars
			? ![Infinity, NaN, 0].includes(
					(skywars.wins || 0) / (skywars.losses || 0)
			  )
				? Number(((skywars.wins || 0) / (skywars.losses || 0)).toFixed(2))
				: 0
			: 0,
		skywarsLevel: playerStats.basic.skywarsLevel,
		duelsWLR: playerStats.major.duels.WLR,
		duelsKDR: player.stats
			? player.stats.Duels
				? ![Infinity, NaN, 0].includes(
						(player.stats.Duels.kills || 0) / (player.stats.Duels.deaths || 0)
				  )
					? Number(
							(
								(player.stats.Duels.kills || 0) /
								(player.stats.Duels.deaths || 0)
							).toFixed(2)
					  )
					: 0
				: 0
			: 0,
		duelsWins: playerStats.basic.duelsWins,
		networkLevel: playerStats.basic.networkLevel,
		achievementPoints: playerStats.basic.achievementPoints,
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
		major: {
			bedwars: null,
			skywars: null,
			skyblock: null,
			duels: null,
			UHC: null,
			blitz: null,
			tnt: null,
			buildBattle: null,
			classic: null,
			arcade: null,
			copsAndCrims: null,
			murderMystery: null,
			hypixelNetwork: null,
			pit: null,
		},
		minor: {
			bedwarsFKDR: null,
			bedwarsWins: null,
			bedwarsBBLR: null,
			bedwarsWLR: null,
			bedwarsLevel: null,
			skywarsKDR: null,
			skywarsWins: null,
			skywarsKills: null,
			skywarsWLR: null,
			skywarsLevel: null,
			duelsWLR: null,
			duelsKDR: null,
			duelsWins: null,
			networkLevel: null,
			achievementPoints: null,
		},
	};

	const strings = {
		major: {
			bedwars: `Bedwars:\n    Level: ${playerStats.major.bedwars.level}\n    Final K/D: ${playerStats.major.bedwars.FKDR}`,
			skywars: `Skywars:\n    Level: ${playerStats.major.skywars.level}\n    Wins: ${playerStats.major.skywars.wins}\n    K/D: ${playerStats.major.skywars.KDR}`,
			skyblock: `SkyBlock:\n    Slayer XP: ${playerStats.major.skyblock.slayersXp}\n    Skill Average: ${playerStats.major.skyblock.skillAverage}`,
			duels: `Duels:\n    Wins: ${playerStats.major.duels.wins}\n    W/L: ${playerStats.major.duels.WLR}\n    Kills: ${playerStats.major.duels.kills}`,
			UHC: `UHC:\n    Wins: ${playerStats.major.UHC.wins}\n    K/D: ${playerStats.major.UHC.KDR}`,
			blitz: `Blitz Survival Games:\n    Wins: ${playerStats.major.blitz.wins}\n    Kills: ${playerStats.major.blitz.kills}`,
			tnt: `TNT Games:\n    Wins: ${playerStats.major.tnt.wins}`,
			buildBattle: `Build Battle:\n    Score: ${playerStats.major.buildBattle.score}`,
			classic: `Classic Games:\n    Wins: ${playerStats.major.classic.wins}`,
			arcade: `Arcade Games:\n    Wins: ${playerStats.major.arcade.wins}`,
			copsAndCrims: `Cops and Crims:\n    Wins: ${playerStats.major.copsAndCrims.wins}\n    Kills: ${playerStats.major.copsAndCrims.kills}`,
			murderMystery: `Murder Mystery:\n    Wins: ${playerStats.major.murderMystery.wins}\n    Kills: ${playerStats.major.murderMystery.kills}`,
			hypixelNetwork: `Hypixel Network:\n    Level: ${playerStats.major.hypixelNetwork.level}\n    Acheivement Points: ${playerStats.major.hypixelNetwork.achievementPoints}\n    Karma: ${playerStats.major.hypixelNetwork.karma}`,
			pit: `The Pit:\n    Prestige: ${playerStats.major.pit.prestige}`,
		},
		minor: {
			bedwarsFKDR: `Bedwars Final K/D: ${playerStats.minor.bedwarsFKDR}`,
			bedwarsWins: `Bedwars Wins: ${playerStats.minor.bedwarsWins}`,
			bedwarsBBLR: `Bedwars BBLR: ${playerStats.minor.bedwarsBBLR}`,
			bedwarsWLR: `Bedwars W/L: ${playerStats.minor.bedwarsWLR}`,
			bedwarsLevel: `Bedwars Level: ${playerStats.minor.bedwarsLevel}`,
			skywarsKDR: `Skywars K/D: ${playerStats.minor.skywarsKDR}`,
			skywarsWins: `Skywars Wins: ${playerStats.minor.skywarsWins}`,
			skywarsKills: `Skywars Kills: ${playerStats.minor.skywarsKills}`,
			skywarsWLR: `Skywars W/L: ${playerStats.minor.skywarsWLR}`,
			skywarsLevel: `Skywars Level: ${playerStats.minor.skywarsLevel}`,
			duelsWLR: `Duels W/L: ${playerStats.minor.duelsWLR}`,
			duelsKDR: `Duels K/D: ${playerStats.minor.duelsKDR}`,
			duelsWins: `Duels Wins: ${playerStats.minor.duelsWins}`,
			networkLevel: `Hypixel Network Level: ${playerStats.minor.networkLevel}`,
			achievementPoints: `Achievement Points: ${playerStats.minor.achievementPoints}`,
		},
	};

	// console.log(playerStats);

	let majorResultStr = "";
	let minorResultStr = "";

	for (const i in requirement) {
		for (const j in requirement[i]) {
			if (i === "basic") {
				requirementMet[i][j] = objectiveMet(
					playerStats[i][j],
					requirement[i][j]
				);
			} else if (i === "major") {
				const reqArr = Object.values(requirement[i][j]);
				const statArr = Object.values(playerStats[i][j]);
				let resultArr = [];

				for (let t = 0; t < reqArr.length; t++) {
					resultArr.push(objectiveMet(statArr[t], reqArr[t]));
				}

				requirementMet[i][j] = resultArr.indexOf("❌") >= 0 ? "❌" : "✔ ";

				if (requirementMet[i][j] === "✔ ") {
					majorResultStr += `✔ ${strings[i][j]}\n`;
				}
			} else {
				requirementMet[i][j] = objectiveMet(
					playerStats[i][j],
					requirement[i][j]
				);

				if (requirementMet[i][j] === "✔ ") {
					minorResultStr += `✔ ${strings[i][j]}\n`;
				}
			}
		}
	}

	const basicResultStr = `${requirementMet.basic.networkLevel}Hypixel Network Level: ${playerStats.basic.networkLevel}\n${requirementMet.basic.bedwarsLevel}Bedwars Level: ${playerStats.basic.bedwarsLevel}\n${requirementMet.basic.bedwarsFKDR}Bedwars FKDR: ${playerStats.basic.bedwarsFKDR}\n${requirementMet.basic.skywarsLevel}Skywars Level: ${playerStats.basic.skywarsLevel}\n${requirementMet.basic.skywarsKDR}Skywars KDR: ${playerStats.basic.skywarsKDR}\n${requirementMet.basic.duelsWins}Duels Wins: ${playerStats.basic.duelsWins}\n${requirementMet.basic.achievementPoints}Achievement Points: ${playerStats.basic.achievementPoints}`;

	const totalRequirementsMet = {
		basic: Object.values(requirementMet.basic).includes("❌") ? "❌" : "✅",
		major: Object.values(requirementMet.major).includes("✔ ") ? "✅" : "❌",
		minor:
			Object.values(requirementMet.minor).filter((x) => x === "✔ ").length >= 2
				? "✅"
				: "❌",
	};

	const statCheckEmbed = new Discord.MessageEmbed({
		color: color.green,
		title: "Check List!",
		description:
			"This is a checklist which you can view and see what requirements you meet and if you can join our guild or not.",
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
		],
		timestamp: new Date(),
		footer: {
			text: message.author.username,
			icon_url: message.author.avatarURL({ dynamic: true }),
		},
	});

	await sentMsg.edit(statCheckEmbed);

	return {
		playerData,
		basicResultStr,
		majorResultStr,
		minorResultStr,
		totalRequirementsMet,
		sentMsg,
	};
}

module.exports = {
	name: "checkstats",
	description:
		"Checks your stats to see if you meet minimum requirements to get into our guild.",
	args: true,
	usage: "<username>",
	guildOnly: false,
	cooldown: 5,
	async execute(message, args) {
		let loadingEmbed = new Discord.MessageEmbed({
			color: color.blue,
			title: "Loading...",
			description: "Loading player stats!",
		});

		const botMsg = await message.channel.send(message.author, loadingEmbed);

		return command(message, botMsg, args);
	},
	command,
};
