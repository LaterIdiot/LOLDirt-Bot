const { hypixelAPIKey } = require("../../index");
const { Client } = require("@zikeji/hypixel");
const hypixel = new Client(hypixelAPIKey);
const Discord = require("discord.js");
const findPlayerData = require("../../helpers/findPlayerData");
const { color } = require("../../config.json");

module.exports = {
    name: "verify",
    description:
        "Verifies the user to it's Minecraft account, which allows you to not require to write your minecraft username in commands. Make sure that you added your Discord tag in your social media links on the Hypixel Network, in order for this command to work properly.",
    usage: "<your_minecraft_username>",
    args: true,
    guildOnly: true,
    cooldown: 10,
    async execute(message, args, db) {
        const verified = await db.collection("verified");
        const usernameGiven = args.shift();
        const playerData = await findPlayerData(usernameGiven);

        if (!playerData || !playerData.id || !playerData.name) {
            const playerFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description: "Player does not exist!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return sentMsg.edit(playerFailureEmbed);
        }

        const player = await hypixel.player
            .uuid(playerData.id)
            .catch((err) => console.error(err));

        if (!player) {
            const playerFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description: "Player does not exist on the Hypixel Network!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return sentMsg.edit(playerFailureEmbed);
        }

        const discordTag = player.socialMedia
            ? player.socialMedia.links
                ? player.socialMedia.links.DISCORD
                : null
            : null;

        if (!discordTag) {
            const discordTagFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description:
                    "You don't seem to have added your Discord tag in your social media links on the Hypixel Network, you should add it and logout to update the Hypixel API and then try again!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return message.channel.send(message.author, discordTagFailureEmbed);
        } else if (message.author.tag === discordTag) {
            const query = { discordID: message.author.id };
            const verifiedUser = await verified
                .findOne(query)
                .catch((err) => console.error(err));

            const verificationSuccessEmbed = new Discord.MessageEmbed({
                color: color.green,
                title: "Success!",
                description:
                    "Your Discord account was succesfully verified with your Minecraft account, now you **don't have to write your Minecraft username with any commands!**",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            if (!verifiedUser) {
                const values = {
                    username: playerData.name.toLowerCase(),
                    uuid: playerData.id,
                    discordID: message.author.id,
                };

                await verified
                    .insertOne(values)
                    .catch((err) => console.error(err));
            } else {
                // have different message output for this instance

                if (verifiedUser.username === playerData.name.toLowerCase()) {
                    verificationSuccessEmbed.color = color.red;
                    verificationSuccessEmbed.title = "Failure!";
                    verificationSuccessEmbed.description =
                        "Your verification is already up to date, if you think you have made a change in your Discord tag, then please review your Discord tag on the Hypixel Network and log out to update the Hypixel API and then try again!";
                } else {
                    verificationSuccessEmbed.description =
                        "Your verification was succesfully updated!";
                    const newvalues = {
                        $set: {
                            username: playerData.name.toLowerCase(),
                            uuid: playerData.id,
                        },
                    };

                    await verified
                        .updateOne(query, newvalues)
                        .catch((err) => console.error(err));
                }
            }

            return message.channel.send(
                message.author,
                verificationSuccessEmbed
            );
        } else {
            const verificationFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description:
                    "The Discord tag in your social media links on the Hypixel Network doesn't match with your Discord tag, you should review it and logout to update the Hypixel API and then try again!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return message.channel.send(
                message.author,
                verificationFailureEmbed
            );
        }
    },
};
