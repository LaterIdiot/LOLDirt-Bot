const Discord = require("discord.js");
const { hypixelAPIKey } = require("../../index");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);
const findPlayerName = require("../../helpers/findPlayerData");
const { color } = require("../../config.json");

module.exports = {
    name: "kicklist",
    description:
        "List's all players that don't meet the weekly GXP requirement.",
    guildOnly: true,
    usage: "<mention> [note(s)]",
    permission: "Server Admin",
    async execute(message) {
        const loadingEmbed = new Discord.MessageEmbed({
            color: color.blue,
            title: "Loading...",
            description: "Loading player stats!",
        });

        const sentMsg = await message.channel.send(
            message.author,
            loadingEmbed
        );

        const guild = await hypixel.guild.name("loldirt").catch(() => {
            return null;
        });

        const weeklyPlayerGxp = [];

        try {
            for (const player of guild.members) {
                const weeklyGxp = Object.values(player.expHistory).reduce(
                    (a, b) => a + b
                );

                if (weeklyGxp < 125000) {
                    const playerName = await findPlayerName(null, player.uuid);
                    weeklyPlayerGxp.push({ name: playerName, gxp: weeklyGxp });
                }
            }
        } catch {
            const failureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description: "Mojang API seems to be down, try again later!",
            });

            return sentMsg.edit(failureEmbed);
        }

        let playersListStr = "";

        weeklyPlayerGxp.forEach((i) => {
            playersListStr += `\n\`${i.name}: ${i.gxp}\``;
        });

        const kicklistEmbed = new Discord.MessageEmbed({
            color: color.green,
            title: "Kick List!",
            description: `List of all players that made less than 125,000 GXP.\n${playersListStr}`,
        });

        sentMsg.edit(kicklistEmbed);
    },
};
