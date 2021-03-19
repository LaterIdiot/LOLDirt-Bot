const Discord = require("discord.js");
const { color } = require("../../config.json");

module.exports = {
    name: "ignorelist",
    description:
        "List's all players that are manually ignored from a kicklist.",
    guildOnly: true,
    usage: "",
    permission: "Server Admin",
    async execute(message, args, db) {
        const loadingEmbed = new Discord.MessageEmbed({
            color: color.blue,
            title: "Loading...",
            description: "Loading player stats!",
        });

        const sentMsg = await message.channel.send(
            message.author,
            loadingEmbed
        );

        const kicklistIgnore = await db.collection("kicklistIgnore");
        const ignoredUsernameArr = await kicklistIgnore
            .find({})
            .toArray()
            .then((res) => res.map((i) => i.username))
            .catch((err) => console.error(err));

        const ignoredUsernameStr = `\n\`${ignoredUsernameArr.join("`\n`")}\``;

        const ignoreListEmbed = new Discord.MessageEmbed({
            color: color.orange,
            title: "Ignore List!",
            description: `List of all players that are ignored in a kicklist!\n${ignoredUsernameStr}`,
            timestamp: new Date(),
            footer: {
                text: message.author.username,
                icon_url: message.author.avatarURL({ dynamic: true }),
            },
        });

        return sentMsg.edit(ignoreListEmbed);
    },
};
