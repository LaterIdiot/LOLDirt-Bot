require("dotenv").config();
const Discord = require("discord.js");
const { prefix, dbname, change } = require("../index")

module.exports = (message, client, clientdb, maintenance) => {
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

	if ((command.permission === "Bot Admin") && !(message.author.id === "396323699222904834")) {
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

	if (!client.cooldowns.has(command.name)) {
		client.cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = client.cooldowns.get(command.name);
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
			change(maintenance);

			const collection = clientdb
				.db(dbname)
				.collection("maintenance");
			const query = { name: "maintenance" };
			const newvalues = { $set: { maintenance: maintenance } };
			collection.updateOne(query, newvalues, (err, result) => {
				if (err) throw err;
			});
		} else {
			command.execute(message, args);
		}
	} catch (error) {
		console.error(error);
		message.reply("there was an error trying to execute that command!");
	}
};
