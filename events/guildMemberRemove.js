module.exports = async (member, db) => {
	const verified = await db.collection("verified");
	const query = { discordID: member.id };
	await verified.deleteOne(query).catch((err) => console.error(err));
};
