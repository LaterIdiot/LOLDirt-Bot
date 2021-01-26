module.exports = {
	name: "maintenance",
	description: "Turns maintenence mode on or off.",
	args: true,
	usage: "<state>",
	cooldown: 1,
	permission: "Bot Admin",
	execute(message, args) {
		const state = args.shift();

		if (state === "on") {
			message.channel.send("Maintenance mode: **ON**")
			return true
		} else if (state === "off") {
			message.channel.send("Maintenance mode: **OFF**")
			return false
		}
	}
}