const { changeInvites } = require("../../index");

module.exports = async (client, db) => {
    const verified = await db.collection("verified");
    const verifiedUsers = await verified
        .find({})
        .toArray()
        .catch(console.error);
    const guild = await client.guilds.cache.first();
    const invites = await guild.fetchInvites();
    changeInvites(invites);

    for (const x of verifiedUsers) {
        let exist = false;

        const members = guild.members.cache.array();
        let breakBool = false;
        for (let j of members) {
            if (j.id === x.discordID) {
                exist = true;
                breakBool = true;
                break;
            }
        }
        if (breakBool) break;

        if (!exist) {
            await verified.deleteOne(x).catch((err) => console.error(err));
        }
    }

    console.log("Ready!");

    try {
        require("../custom/timeEventsSetup")(client);
    } catch (err) {
        console.error(err);
    }
};
