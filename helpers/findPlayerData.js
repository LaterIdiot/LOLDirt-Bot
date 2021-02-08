const fetch = require("node-fetch");

module.exports = async (username) => {
	const playerData = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${username}`
	)
		.then((response) => response.json())
		.then((data) => {
			return data;
		})
		.catch(() => {
			return null;
		});

	if (playerData.id || playerData.name) {
		return playerData;
	} else {
		return null;
	}
};
