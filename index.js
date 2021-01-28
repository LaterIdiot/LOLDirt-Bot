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

clientdb.connect((err) => {
	if (err) throw err;
	db = clientdb.db(dbname);
	db.collection("maintenance").findOne({}, (err, result) => {
		if (err) throw err;
		maintenance = result.maintenance;
	});
});

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
client.once("ready", () => {
	console.log("Ready!");
});

const message = require("./events/message");
client.on("message", (msg) => {
	message(msg, client, db, maintenance);
});

client.login(process.env.BOT_TOKEN);
