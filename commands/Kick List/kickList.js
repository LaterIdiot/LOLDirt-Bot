const Discord = require("discord.js");
const { hypixelAPIKey } = require("../../index");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);
const findPlayerData = require("../../helpers/findPlayerData");
const { color, weeklyGxpRequirement } = require("../../config.json");
const numFormat = (num) => Intl.NumberFormat("en-US").format(num);

module.exports = {
    name: "kicklist",
    description:
        "List's all players that don't meet the weekly GXP requirement.",
    guildOnly: true,
    cooldown: 120,
    usage: "",
    permission: "Server Admin",
    async execute(message, args, db) {
        const kicklistIgnore = await db.collection("kicklistIgnore");

        const loadingEmbed = new Discord.MessageEmbed({
            color: color.blue,
            title: "Loading...",
            description: "Loading player stats!",
        });

        const sentMsg = await message.channel.send(
            message.author,
            loadingEmbed
        );

        let kicklistIgnoreIdArr = await kicklistIgnore
            .find({})
            .toArray()
            .then((res) => res.map((i) => i.uuid))
            .catch(console.error);

        const guild = await hypixel.guild.name("loldirt").catch(() => {
            return null;
        });

        const weeklyPlayerGxp = [];

        try {
            for (const player of guild.members) {
                const weeklyGxp = Object.values(player.expHistory).reduce(
                    (a, b) => a + b
                );

                if (
                    !kicklistIgnoreIdArr.includes(player.uuid) &&
                    weeklyGxp < weeklyGxpRequirement
                ) {
                    const playerName = await findPlayerData(null, player.uuid);

                    weeklyPlayerGxp.push({
                        name: playerName,
                        gxp: weeklyGxp,
                    });
                }
            }
        } catch {
            const failureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description:
                    "Mojang API seems to be down, try again 125 seconds later!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({
                        dynamic: true,
                    }),
                },
            });

            return sentMsg.edit(failureEmbed);
        }

        weeklyPlayerGxp.sort((a, b) => a.gxp - b.gxp);

        let playersListStr = "";

        weeklyPlayerGxp.forEach((i) => {
            playersListStr += `\n\`${i.name} > ${numFormat(i.gxp)}\``;
        });

        const kicklistEmbed = new Discord.MessageEmbed({
            color: color.orange,
            title: "Kick List!",
            description: `List of all players that made less than ${numFormat(
                weeklyGxpRequirement
            )} GXP in the past week or the past 7 days!\n${playersListStr}`,
            timestamp: new Date(),
            footer: {
                text: message.author.username,
                icon_url: message.author.avatarURL({
                    dynamic: true,
                }),
            },
        });

        sentMsg.edit(kicklistEmbed);
    },
};
