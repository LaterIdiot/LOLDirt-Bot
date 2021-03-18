require("dotenv").config();
const Discord = require("discord.js");
const { prefix, change } = require("../index");
const getUserFromMention = require("../helpers/getUserFromMention");
const { color } = require("../config.json");

module.exports = async (message, client, db, maintenance) => {
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
            "Sorry, I am on maintenance mode only my creator can send me commands!"
        );
    }

    // Manages command permissions
    if (command.permission) {
        if (
            command.permission === "Bot Admin" &&
            !(message.author.id === "396323699222904834")
        ) {
            return message.reply("Sorry, but only for my creator!");
        } else if (
            command.permission === "Server Admin" &&
            !message.member.hasPermission("ADMINISTRATOR")
        ) {
            return message.reply("Sorry, but only for server admins!");
        }
    }

    // Manages whether the command is meant to be called in dm or not
    if (command.guildOnly && message.channel.type === "dm") {
        return message.reply("I can't execute that command inside DMs!");
    }

    if (!args.length && command.allowVerified) {
        const verified = await db.collection("verified");
        const query = { discordID: message.author.id };
        const result = await verified
            .findOne(query)
            .catch((err) => console.error(err));

        if (result) args.push(result.username);
    }

    // Manages argument requirements if there are any
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    let mentionedUser = null;
    if (command.mention) {
        let mention = args.shift().match(Discord.MessageMentions.USERS_PATTERN);
        if (mention) {
            mentionedUser = getUserFromMention(mention.shift(), message);

            if (!mentionedUser) {
                const sendingFailureEmbed = new Discord.MessageEmbed({
                    color: color.red,
                    title: "Failure!",
                    description:
                        "Sorry, the person you mentioned is not in this server, so I can't run this command!",
                    timestamp: new Date(),
                    footer: {
                        text: message.author.username,
                        icon_url: message.author.avatarURL({ dynamic: true }),
                    },
                });

                return message.channel.send(
                    message.author,
                    sendingFailureEmbed
                );
            }
        } else {
            const mentionFailureEmbed = new Discord.MessageEmbed({
                color: color.red,
                title: "Failure!",
                description: `You didn't mention anyone, please mention someone to run this command, and the correct usage is \`${prefix}${command.name} ${command.usage}\`!`,
                timestamp: new Date(),
                footer: {
                    text: message.author.username,
                    icon_url: message.author.avatarURL({ dynamic: true }),
                },
            });

            return message.channel.send(message.author, mentionFailureEmbed);
        }
    }

    // Manages Cooldowns
    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Discord.Collection());
    }

    const waitCollection = client.cooldowns.get(command.name);

    if (command.cooldown === "dynamic") {
        now = Date.now();

        if (waitCollection.has(message.author.id)) {
            return message.reply(
                "you have to complete your command instance before starting another!"
            );
        }

        waitCollection.set(message.author.id, "wait");
    } else {
        const now = Date.now();
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (waitCollection.has(message.author.id)) {
            const expirationTime =
                waitCollection.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
                return message.reply(
                    `please wait ${timeLeft} more second(s) before reusing the \`${command.name}\` command!`
                );
            }
        }

        waitCollection.set(message.author.id, now);
        setTimeout(
            () => waitCollection.delete(message.author.id),
            cooldownAmount
        );
    }

    try {
        if (command.name === "maintenance") {
            maintenance = command.execute(message, args, db);
            change(maintenance);

            const query = { name: "maintenance" };
            const newvalues = { $set: { maintenance: maintenance } };
            db.collection("maintenance").updateOne(
                query,
                newvalues,
                (err, result) => {
                    if (err) throw err;
                }
            );
        } else {
            command.execute(message, args, db, mentionedUser).then(() => {
                if (command.cooldown === "dynamic")
                    waitCollection.delete(message.author.id);
            });
        }
    } catch (error) {
        console.error(error);
        message.reply("there was an error trying to execute that command!");
    }
};
