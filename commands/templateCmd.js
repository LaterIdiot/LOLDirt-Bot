module.exports = {
	name: 'templateCmd',
	description: 'Type your description.',
	args: false,
	usage: '<required> [option]',
	guildOnly: false,
	cooldown: 5,
	aliases: ['placeholder', 'temp'],
	execute(message, args) {
		message.reply(`You said, ${args}`)
	}
};