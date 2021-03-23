const Discord = require("discord.js");
const { color } = require("../config.json");
const { changeInvites } = require("../index");

module.exports = async (member, invites) => {
    try {
        const existingInvites = invites;
        invites = await member.guild.fetchInvites();
        changeInvites(invites);

        if (existingInvites.size > invites.size) {
            for (let k of existingInvites.keys()) {
                if (!invites.get(k)) existingInvites.delete(k);
            }
        }

        const invite = await invites.find(
            (i) => existingInvites.get(i.code).uses < i.uses
        );

        // const randomWelcomeMsgs = [
        //     "Someone Joined our Server!",
        //     "Someone Appeared!",
        //     "We got someone!",
        //     "Our server is getting bigger!",
        //     "We got a recruit!",
        //     `We got ${invite.inviter.username}!`,
        // ];

        const logEmbed = new Discord.MessageEmbed({
            color: color.orange,
            title: "Someone Joined our Server!",
            description: `${member.user} joined using invite code \`${invite.code}\` from ${invite.inviter}. Invite was used \`${invite.uses}\` times since its creation!`,
            timestamp: new Date(),
            footer: {
                text: invite.inviter.username,
                icon_url: invite.inviter.avatarURL({ dynamic: true }),
            },
        });

        return member.guild.channels.cache
            .find((i) => i.name === "invite-log")
            .send(logEmbed);
    } catch (err) {
        console.error(err);
    }
};
