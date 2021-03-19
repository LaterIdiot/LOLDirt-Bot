const Discord = require("discord.js");
const { hypixelAPIKey } = require("../../index");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);
const checkStats = require("./checkStats");
const findPlayerData = require("../../helpers/findPlayerData");
const { questions, color, applyCooldown } = require("../../config.json");

module.exports = {
    name: "apply",
    description: "Starts an application to apply for the guild.",
    args: true,
    usage: "<your_minecraft_username>",
    guildOnly: true,
    allowVerified: true,
    cooldown: "dynamic",
    async execute(message, args, db) {
        let loadingEmbed = new Discord.MessageEmbed({
            color: color.blue,
            title: "Loading...",
            description: "Loading player stats!",
        });

        const sentMsg = await message.channel.send(
            message.author,
            loadingEmbed
        );

        const username = args[0].toLowerCase();

        const applicants = await db.collection("applicants");
        const query = { discordID: message.author.id };
        let applicantsData = await applicants
            .findOne(query)
            .catch((err) => console.error(err));

        if (applicantsData) {
            const now = Date.now();

            if (now - applicantsData.timestamp >= applyCooldown * 1000) {
                applicantsData = null;

                await applicants.deleteOne(query, (err) => {
                    if (err) throw err;
                });
            }
        }

        const guild = await hypixel.guild.name("loldirt").catch(() => {
            return null;
        });
        const uuid = await findPlayerData(username);

        if (guild) {
            if (guild.members) {
                for (let x of guild.members) {
                    if (x.uuid.includes(uuid.id)) {
                        const alreadyFailureEmbed = new Discord.MessageEmbed({
                            color: color.red,
                            title: "Failure!",
                            description:
                                "It looks like you are already in the guild!",
                            timestamp: new Date(),
                            footer: {
                                text: message.author.username,
                                icon_url: message.author.avatarURL({
                                    dynamic: true,
                                }),
                            },
                        });

                        return sentMsg.edit(
                            message.author,
                            alreadyFailureEmbed
                        );
                    }
                }
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

        if (!applicantsData) {
            try {
                let loadingEmbed = new Discord.MessageEmbed({
                    color: color.blue,
                    title: "Loading...",
                    description: "Loading player stats!",
                });

                const botMsg = await message.author.send(
                    message.author,
                    loadingEmbed
                );

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

                await sentMsg.edit(sentSuccessEmbed);

                const embedTitle =
                    "This is an overview of the guild requirements you meet, however the outcome of this application is not determined by this overview and there will be exceptions made, good luck!";
                const {
                    playerData,
                    basicResultStr,
                    majorResultStr,
                    minorResultStr,
                    totalRequirementsMet,
                } = await checkStats.command(message, botMsg, args, embedTitle);

                if (!playerData) {
                    const errorEmbed = new Discord.MessageEmbed({
                        color: color.red,
                        title: "Failure!",
                        description:
                            "Couldn't access player stats try again later!",
                        timestamp: new Date(),
                        footer: {
                            text: message.author.username,
                            icon_url: message.author.avatarURL({
                                dynamic: true,
                            }),
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
                        .awaitMessages(
                            (m) => m.author.id === message.author.id,
                            {
                                max: 1,
                                time: x.cooldown * 1000,
                                errors: ["time"],
                            }
                        )
                        .then((collected) => {
                            answers.push({
                                question: x.question,
                                answer: collected.first().content,
                            });
                            return false;
                        })
                        .catch(() => {
                            message.author.send(`${message.author}, Time Out`);
                            return true;
                        });

                    if (wait) return;
                }

                let formStr = "";

                for (let i of answers) {
                    formStr += `Q: ${i.question}\nA: ${i.answer}\n\n`;
                }

                const application = new Discord.MessageEmbed({
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
                                majorResultStr
                                    ? majorResultStr
                                    : "No gamemode requirement met."
                            }\`\`\``,
                        },
                        {
                            name: `${totalRequirementsMet.minor} Minor Requirements:`,
                            value: `\`\`\`\n${
                                minorResultStr
                                    ? minorResultStr
                                    : "No requirement met."
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
                    description:
                        "Your application has been submitted successfuly!",
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({ dynamic: true }),
                    },
                });

                const applicantData = {
                    type: "processing",
                    timestamp: Date.now(),
                    username: playerData.name.toLowerCase(),
                    discordID: message.author.id,
                };

                await applicants
                    .insertOne(applicantData)
                    .catch((err) => console.log(err));

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
        } else {
            if (applicantsData.username !== username) {
                const appliedFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description:
                        "You have already applied with a different username, you can only have one application at a time!",
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({ dynamic: true }),
                    },
                });

                return sentMsg.edit(appliedFailureEmbed);
            }

            const cooldownEmbed = new Discord.MessageEmbed({
                color: color.blue,
                title: "Cooldown!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            if (applicantsData.type === "denied") {
                const now = Math.floor(Date.now() / 1000);
                const timestamp = Math.floor(applicantsData.timestamp / 1000);
                let timeLeft;
                const days = (applyCooldown - (now - timestamp)) / 60 / 60 / 24;
                const hours = (applyCooldown - (now - timestamp)) / 60 / 60;
                const minutes = (applyCooldown - (now - timestamp)) / 60;
                const seconds = applyCooldown - (now - timestamp);

                if (days >= 1) {
                    cooldownEmbed.description = `Your application was denied and you can apply again in ${Math.floor(
                        days
                    )} days!`;
                } else if (hours >= 1) {
                    cooldownEmbed.description = `Your application was denied and you can apply again in ${Math.floor(
                        hours
                    )} hours!`;
                } else if (minutes >= 1) {
                    cooldownEmbed.description = `Your application was denied and you can apply again in ${Math.floor(
                        minutes
                    )} minutes!`;
                } else {
                    cooldownEmbed.description = `Your application was denied and you can apply again in ${seconds} seconds!`;
                }

                return sentMsg.edit(cooldownEmbed);
            } else if (applicantsData.type === "processing") {
                cooldownEmbed.description =
                    "Your application is still being processed!";
                return sentMsg.edit(cooldownEmbed);
            }
        }
    },
};
