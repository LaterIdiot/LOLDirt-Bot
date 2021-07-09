const Discord = require("discord.js");
const { color } = require("../../config.json");

module.exports = {
    name: "deny",
    description: "Sends an deny message to whoever is mentioned.",
    args: true,
    guildOnly: true,
    mention: true,
    usage: "<mention> [note(s)]",
    permission: "Moderator",
    async execute(message, args, db, mentionedUser) {
        mentionedUser = mentionedUser.user;
        const applicants = await db.collection("applicants");

        const query = { discordID: mentionedUser.id };
        let applicantsData = await applicants
            .findOne(query)
            .catch(console.error);

        if (
            applicantsData &&
            !(applicantsData ? applicantsData.type === "denied" : false)
        ) {
            const deniedEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Sorry :(",
                description: `Your guild application has been Denied!\n\n${
                    args[0]
                        ? `**Notes From ${message.author}:** ${args.join(" ")}`
                        : ""
                }`,
                timestamp: new Date(),
                footer: {
                    text: mentionedUser.username,
                    icon_url: mentionedUser.avatarURL({ dynamic: true }),
                },
            });

            try {
                await mentionedUser.send(mentionedUser, deniedEmbed);
            } catch {
                const sendingFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description:
                        "It seems like I can't DM the mentioned person! They might have `Allow direct messages from server members.` disabled in the server `Privacy Settings`!",
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({ dynamic: true }),
                    },
                });

                return message.channel.send(
                    message.author,
                    sendingFailureEmbed
                );
            }

            const sentSuccessEmbed = new Discord.MessageEmbed({
                color: color.green,
                title: "Success!",
                description: `Successfully notified ${mentionedUser} that they have been Denied!`,
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            const newvalues = {
                $set: { timestamp: Date.now(), type: "denied" },
            };

            await applicants.updateOne(query, newvalues).catch(console.error);

            return message.channel.send(message.author, sentSuccessEmbed);
        } else {
            const applicantFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description:
                    "This person hasn't submitted an application or is already denied!",
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return message.channel.send(message.author, applicantFailureEmbed);
        }
    },
};
