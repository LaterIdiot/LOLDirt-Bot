const Discord = require("discord.js");
const { hypixelAPIKey } = require("../../index");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);
const findPlayerData = require("../../tools/findPlayerData");
const { color, mcGuild } = require("../../config.json");

module.exports = {
    name: "ignore",
    description: "Allows you to ignore player's from a kicklist.",
    guildOnly: true,
    cooldown: 0,
    args: true,
    usage: "<minecraft-username>",
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

        const username = args[0].toLowerCase();
        const query = { username: username };
        const ignoredPlayer = await kicklistIgnore
            .findOne(query)
            .catch(console.error);

        if (ignoredPlayer) {
            const playerData = await findPlayerData(username);

            if (!playerData) {
                const playerFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description: `\`${username}\` does not exist or the Mojang API is down!`,
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({
                            dynamic: true,
                        }),
                    },
                });

                return sentMsg.edit(playerFailureEmbed);
            }

            if (playerData.id === ignoredPlayer.uuid) {
                const ignoredFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description: `\`${username}\` already exists and its uuid is also up to date in the Ignore list!`,
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({
                            dynamic: true,
                        }),
                    },
                });

                return sentMsg.edit(ignoredFailureEmbed);
            } else {
                const newvalues = {
                    $set: { uuid: playerData.id },
                };

                await kicklistIgnore
                    .updateOne(query, newvalues)
                    .catch(console.error);

                const uuidUpdatedEmbed = new Discord.MessageEmbed({
                    color: color.green,
                    title: "Success!",
                    description: `\`${username}\` already exists and its uuid is now up to date!`,
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({
                            dynamic: true,
                        }),
                    },
                });

                return sentMsg.edit(uuidUpdatedEmbed);
            }
        } else {
            const playerData = await findPlayerData(username);

            if (!playerData) {
                const playerFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description: `\`${username}\` does not exist or the Mojang API is down!`,
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({
                            dynamic: true,
                        }),
                    },
                });

                return sentMsg.edit(playerFailureEmbed);
            }

            const guild = await hypixel.guild
                .name(mcGuild.name)
                .catch(() => null);

            if (guild) {
                const guildMember = guild.members.find(
                    (member) => member.uuid === playerData.id
                );

                if (!guildMember) {
                    const inGuildFailureEmbed = new Discord.MessageEmbed({
                        color: color.red,
                        title: "Failure!",
                        description: `It looks like \`${username}\` is not in the guild!`,
                        timestamp: new Date(),
                        footer: {
                            text: message.author.username,
                            icon_url: message.author.avatarURL({
                                dynamic: true,
                            }),
                        },
                    });

                    return sentMsg.edit(message.author, inGuildFailureEmbed);
                }
            } else {
                const apiNoteEmbed = new Discord.MessageEmbed({
                    color: color.yellow,
                    title: "Note!",
                    description:
                        "Can't access guild because the Hypixel API is down so, I couldn't check if you already exist in the guild or not and started the application anyway!",
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({ dynamic: true }),
                    },
                });

                await message.channel.send(message.author, apiNoteEmbed);
            }

            const ignoredPlayerData = {
                username: username,
                uuid: playerData.id,
            };

            await kicklistIgnore
                .insertOne(ignoredPlayerData)
                .catch(console.error);

            const ignoredSuccessEmbed = new Discord.MessageEmbed({
                color: color.green,
                title: "Success!",
                description: `\`${username}\` added to Kicklist Ignore list!`,
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({
                        dynamic: true,
                    }),
                },
            });

            return sentMsg.edit(ignoredSuccessEmbed);
        }
    },
};
