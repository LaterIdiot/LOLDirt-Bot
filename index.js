// module that allows dotenv files to be read
require("dotenv").config();

// loads all the config information for bot and important info
const prefix = process.env.PREFIX;
const hypixelAPIKey = process.env.HYPIXEL_API_KEY;
const dbname = process.env.MONGO_DB_DB;

// makes prefix and hypixelAPIKey available to whoever refrences this file
let maintenance = true;

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@bot-storage.hfy3d.mongodb.net/${dbname}?retryWrites=true&w=majority`;
const clientdb = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
let db;

clientdb
    .connect()
    .then(async (err, result) => {
        db = clientdb.db(dbname);
        maintenance = await db
            .collection("maintenance")
            .findOne({})
            .catch((err) => console.error(err));

        maintenance = maintenance.maintenance;
        login();
    })
    .catch((err) => console.log(err));

// db = clientdb.db(dbname);
// 	db.collection("maintenance").findOne({}, (err, result) => {
// 		if (err)
// 			throw err;
// 		maintenance = result.maintenance;
// 	});

module.exports = {
    prefix,
    hypixelAPIKey,
    change(boolean) {
        maintenance = boolean;
    },
};

const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

// puts all file names that end with .js in an array
const fs = require("fs");
const commandFolders = fs
    .readdirSync("./commands")
    .filter((folder) => !folder.endsWith(".js"));
for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.commands.set("help", require("./commands/help"));

// sends console log ones bot is ready
client.once("ready", async () => {
    console.log("Ready!");
    const verified = await db.collection("verified");
    const verifiedUsers = await verified
        .find({})
        .toArray()
        .catch((err) => console.error(err));
    const guilds = client.guilds.cache.array();
    const memebersIDArr = [];

    for (const x of verifiedUsers) {
        let exist = false;
        for (let i of guilds) {
            const members = i.members.cache.array();
            let breakBool = false;
            for (let j of members) {
                if (j.id === x.discordID) {
                    exist = true;
                    breakBool = true;
                    break;
                }
            }
            if (breakBool) break;
        }

        if (!exist) {
            await verified.deleteOne(x).catch((err) => console.error(err));
        }
    }
});

client.on("message", (msg) => {
    require("./events/message")(msg, client, db, maintenance);
});

client.on("guildMemberRemove", (member) => {
    require("./events/guildMemberRemove")(member, db);
});

function login() {
    client.login(process.env.BOT_TOKEN);
}
