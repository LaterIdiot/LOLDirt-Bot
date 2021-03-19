const Discord = require("discord.js");
const { color } = require("../../config.json");

module.exports = {
    name: "perms",
    description: "Finds all permissions of a player.",
    args: true,
    guildOnly: true,
    mention: true,
    usage: "<mention>",
    cooldown: 0,
    permission: "Bot Admin",
    async execute(message, args, db, mentionedUser) {
        const permissions = mentionedUser.permissions.toArray();
        const permsStr = `\n\`${permissions.join("`\n`")}\``;

        const permsEmbed = new Discord.MessageEmbed({
            color: color.green,
            title: "Permmisions!",
            description: `All the permmisions of ${mentionedUser.user}!\n${permsStr}`,
            timestamp: new Date(),
            footer: {
                text: message.author.username,
                icon_url: message.author.avatarURL({ dynamic: true }),
            },
        });

        message.channel.send(message.author, permsEmbed);
        return message.delete();
    },
};
