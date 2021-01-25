// module that allows dotenv files to be read
require("dotenv").config();

let maintenance = true;

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@bot-storage.hfy3d.mongodb.net/botStorage?retryWrites=true&w=majority`;
const clientdb = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
clientdb.connect((err) => {
	if (err) throw err;
	const collection = clientdb.db("botStorage").collection("maintenance");
	collection.findOne({}, (err, result) => {
		if (err) throw err;
		maintenance = result.maintenance;
	});
});


// loads node modules
const fs = require("fs");
const Discord = require("discord.js");

// loads all the config information for bot and important info
const prefix = process.env.PREFIX;
const token = process.env.BOT_TOKEN;
const hypixelAPIKey = process.env.HYPIXEL_API_KEY;

// makes prefix and hypixelAPIKey available to whoever refrences this file
module.exports = { prefix, hypixelAPIKey };

// creates a discord client which will be the bot
const client = new Discord.Client();

// initializes a collection or a map
client.commands = new Discord.Collection();

// puts all file names that end with .js in an array
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

// goes through each element of commandFiles array and stores the refrence to that file in client.commands collection
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// sets new collection for cooldown
const cooldowns = new Discord.Collection();

// sends console log ones bot is ready
client.once("ready", () => {
	console.log("Ready!");
});

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command =
		client.commands.get(commandName) ||
		client.commands.find(
			(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
		);

	if (!command) return;

	if (maintenance && !(message.author.id === "396323699222904834")) {
		return message.reply(
			"Sorry I am on maintenance mode only my creator can send me commands."
		);
	}

	if (command.botAdminOnly && !(message.author.id === "396323699222904834")) {
		return message.reply("Sorry, but only for my creator.");
	}

	if (command.guildOnly && message.channel.type === "dm") {
		return message.reply("I can't execute that command inside DMs!");
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply("You can not do this!");
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
			return message.reply(
				`please wait ${timeLeft} more second(s) before reusing the \`${command.name}\` command.`
			);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		if (command.name === "maintenance") {
			maintenance = command.execute(message, args);

			const collection = clientdb.db("botStorage").collection("maintenance");
			const query = { name: "maintenance" };
			const newvalues = {$set: {maintenance: maintenance }};
			collection.updateOne(query, newvalues, (err, result) => {
				if (err) throw err;
				console.log("1 document updated");
				maintenance = result.maintenance;
			});
		} else {
			command.execute(message, args);
		}

		console.log(maintenance);
	} catch (error) {
		console.error(error);
		message.reply("there was an error trying to execute that command!");
	}
});

client.login(token);
