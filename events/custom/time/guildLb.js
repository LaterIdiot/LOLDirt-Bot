const guildLbData = require("../../../tools/guildLbData");
const Discord = require("discord.js");
const { color, server } = require("../../../config.json");

module.exports = async (client) => {
    function glb() {
        (async () => {
            const lb = await guildLbData();
            let lbStr = "";
            lb.forEach((i) => {
                if (i.name === server.name) {
                    lbStr += `\n**\`${i.position}. ${i.name} – ${i.level} (${i.exp})\`**`;
                } else {
                    lbStr += `\n\`${i.position}. ${i.name} – ${i.level} (${i.exp})\``;
                }
            });

            const lbEmbed = new Discord.MessageEmbed({
                color: color.green,
                title: `Guild Leaderboard!`,
                description: lbStr,
            });

            const guild = await client.guilds.cache.first();
            return guild.channels.cache
                .find((i) => i.name === server.guildLbLog && i.type === "text")
                .send(lbEmbed);
        })();
    }

    glb();
    setInterval(glb, 3600000 * 3);
};
