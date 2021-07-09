const Discord = require("discord.js");
const { color } = require("../../config.json");

module.exports = {
    name: "accept",
    description: "Sends an accept message to whoever is mentioned.",
    args: true,
    guildOnly: true,
    mention: true,
    usage: "<mention> [note(s)]",
    permission: "Server Admin",
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
            const acceptedEmbed = new Discord.MessageEmbed({
                color: color.green,
                title: "🎉 CONGRATS! 🎉",
                description: `Your guild application has been ACCEPTED!\n\n${
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
                await mentionedUser.send(mentionedUser, acceptedEmbed);
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
                description: `Successfully notified ${mentionedUser} that they have been ACCEPTED!`,
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            await applicants.deleteOne(query).catch(console.error);

            return message.channel.send(message.author, sentSuccessEmbed);
        } else {
            const applicantFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description:
                    "This person hasn't submitted an application or is already accepted!",
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
