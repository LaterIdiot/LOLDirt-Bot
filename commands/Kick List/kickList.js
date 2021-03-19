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
    cooldown: 1,
    usage: "[ignore|unignore]",
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

        if (args.length && args.length === 2) {
            const username = args[1].toLowerCase();

            if (args[0].toLowerCase() === "ignore") {
                const query = { username: username };
                const ignoredPlayer = await kicklistIgnore
                    .findOne(query)
                    .catch((err) => console.error(err));

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
                        return kicklistIgnore
                            .updateOne(query, newvalues)
                            .then(() => {
                                const uuidUpdatedEmbed = new Discord.MessageEmbed(
                                    {
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
                                    }
                                );

                                return sentMsg.edit(uuidUpdatedEmbed);
                            })
                            .catch((err) => console.error(err));
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

                    const ignoredPlayerData = {
                        username: username,
                        uuid: playerData.id,
                    };

                    return kicklistIgnore
                        .insertOne(ignoredPlayerData)
                        .then(() => {
                            const ignoredSuccessEmbed = new Discord.MessageEmbed(
                                {
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
                                }
                            );

                            return sentMsg.edit(ignoredSuccessEmbed);
                        })
                        .catch((err) => console.error(err));
                }
            } else if (args[0].toLowerCase() === "unignore") {
                const query = { username: username };
                const ignoredPlayer = await kicklistIgnore
                    .findOne(query)
                    .catch((err) => console.error(err));

                if (ignoredPlayer) {
                    return kicklistIgnore
                        .deleteOne(query)
                        .then(() => {
                            const unignoreSuccessEmbed = new Discord.MessageEmbed(
                                {
                                    color: color.green,
                                    title: "Success!",
                                    description: `\`${username}\` is removed from the kicklist ignore list successfuly!`,
                                    timestamp: new Date(),
                                    footer: {
                                        text: message.author.username,
                                        icon_url: message.author.avatarURL({
                                            dynamic: true,
                                        }),
                                    },
                                }
                            );

                            return sentMsg.edit(unignoreSuccessEmbed);
                        })
                        .catch((err) => console.error(err));
                } else {
                    const unignoreFailureEmbed = new Discord.MessageEmbed({
                        color: color.red,
                        title: "Failure!",
                        description: `\`${username}\` is not in ignore list!`,
                        timestamp: new Date(),
                        footer: {
                            text: message.author.username,
                            icon_url: message.author.avatarURL({
                                dynamic: true,
                            }),
                        },
                    });

                    return sentMsg.edit(unignoreFailureEmbed);
                }
            } else {
                const argsFailureEmbed = Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description: `The option you provided was invalid!`,
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({
                            dynamic: true,
                        }),
                    },
                });

                return sentMsg.edit(argsFailureEmbed);
            }
        } else if (args.length === 0) {
            let kicklistIgnoreIdArr = await kicklistIgnore
                .find({})
                .toArray()
                .then((res) => res.map((i) => i.uuid))
                .catch((err) => console.error(err));

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
                        const playerName = await findPlayerData(
                            null,
                            player.uuid
                        );

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
        } else {
            const argsFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description: `Invalid amounts of arguments, this command only takes 2 arguments!\n`,
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({
                        dynamic: true,
                    }),
                },
            });

            return sentMsg.edit(argsFailureEmbed);
        }
    },
};
