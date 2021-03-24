const fs = require("fs");

module.exports = (client) => {
    const timeEvents = fs
        .readdirSync("./events/custom/time")
        .filter((file) => file.endsWith(".js"));

    for (const event of timeEvents) {
        require(`./time/${event}`)(client);
    }
};
