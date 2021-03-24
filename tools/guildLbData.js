const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async () => {
    const html = await axios
        .get("https://sk1er.club/leaderboards/newdata/GUILD_LEVEL")
        .then((response) => response.data)
        .catch(() => null);

    const $ = cheerio.load(html);

    const lb = [];
    const rows = $("tbody tr");
    rows.each((i, e) => {
        lb.push({
            position: $(e).find("td:nth-child(1)").text(),
            name: $(e).find("td:nth-child(3)").text(),
            level: $(e).find("td:nth-child(4)").text(),
            exp: $(e).find("td:nth-child(6)").text(),
        });
    });

    const loldirtIndex = lb.findIndex((i) => i.name === "loldirt");
    const start = loldirtIndex - 2 < 0 ? 0 : loldirtIndex - 2;
    const end =
        loldirtIndex - 2 < 0
            ? loldirtIndex + 3 + Math.abs(loldirtIndex - 2)
            : loldirtIndex + 3;
    const nearFiveLb = lb.slice(start, end);
    // const index = nearFiveLb.findIndex((i) => i.name === "loldirt");
    // const element = nearFiveLb[index];
    // nearFiveLb[index] = {
    //     position: `**${element.position}**`,
    //     name: `**${element.name}**`,
    //     level: `**${element.level}**`,
    //     exp: `**${element.exp}**`,
    // };

    return nearFiveLb;
};
