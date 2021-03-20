const Discord = require("discord.js");
const { color } = require("../../config.json");

module.exports = {
    name: "unignore",
    description: "Allows you to unignore player's from a kicklist.",
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
            await kicklistIgnore.deleteOne(query).catch(console.error);

            const unignoreSuccessEmbed = new Discord.MessageEmbed({
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
            });

            return sentMsg.edit(unignoreSuccessEmbed);
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
    },
};
