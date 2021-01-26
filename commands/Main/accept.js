const Discord = require("discord.js");
const { color } = require("../../config.json");
const getUserFromMention = require("../../helpers/getUserFromMention");

module.exports = {
	name: "accept",
	description: "Sends an accept message to whoever is mentioned.",
	args: true,
	guildOnly: true,
	usage: "<mention> [note(s)]",
	permission: "Server Admin",
	async execute(message, args) {
		let mention = args.shift().match(Discord.MessageMentions.USERS_PATTERN);
		if (mention) {
			const mentionedUser = getUserFromMention(mention[0], message.client);
			if (mentionedUser) {
				const acceptedEmbed = new Discord.MessageEmbed({
					color: color.green,
					title: "🎉 CONGRATS! 🎉",
					description: `Your guild application has been ACCEPTED!\n\n${
						args[0] ? `**Notes From ${message.author}:** ${args.join(" ")}` : ""
					}`,
					timestamp: new Date(),
					footer: {
						text: mentionedUser.username,
						icon_url: mentionedUser.avatarURL({ dynamic: true }),
					},
				});

				try {
					await mentionedUser.send(mentionedUser, acceptedEmbed);
				} catch {
					const sendingFailureEmbed = new Discord.MessageEmbed({
						color: color.red,
						title: "Failure!",
						description:
							"It seems like I can't DM the mentioned person! They might have `Allow direct messages from server members.` disabled in the server `Privacy Settings`!",
						timestamp: new Date(),
						footer: {
							text: message.author.username,
							icon_url: message.author.avatarURL({ dynamic: true }),
						},
					});

					return message.channel.send(message.author, sendingFailureEmbed);
				}

				const sentSuccessEmbed = new Discord.MessageEmbed({
					color: color.green,
					title: "Success!",
					description: `Successfully notified ${mention} that they have been ACCEPTED!`,
					timestamp: new Date(),
					footer: {
						text: message.author.username,
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
				});

				return message.channel.send(message.author, sentSuccessEmbed);
			} else {
				const sendingFailureEmbed = new Discord.MessageEmbed({
					color: color.red,
					title: "Failure!",
					description:
						"Sorry, the person you mentioned is not in any of the server's I am in, so I can't send this accept message!",
					timestamp: new Date(),
					footer: {
						text: message.author.username,
						icon_url: message.author.avatarURL({ dynamic: true }),
					},
				});

				return message.channel.send(message.author, sendingFailureEmbed);
			}
		} else {
			const mentionFailureEmbed = new Discord.MessageEmbed({
				color: color.red,
				title: "Failure!",
				description:
					"You didn't mention anyone, please mention someone to send accept message to, and the correct usage is `dirt.accept <mention> [note(s)]`",
				timestamp: new Date(),
				footer: {
					text: message.author.username,
					icon_url: message.author.avatarURL({ dynamic: true }),
				},
			});

			return message.channel.send(message.author, mentionFailureEmbed);
		}
	},
};
