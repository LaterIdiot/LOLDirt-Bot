const fetch = require("node-fetch");

module.exports = async (username, uuid) => {
    if (uuid) {
        const playerData = await fetch(
            `https://api.mojang.com/user/profiles/${uuid}/names`
        )
            .then((response) => response.json())
            .then((data) => {
                return data;
            })
            .catch(() => {
                return null;
            });

        return playerData[playerData.length - 1].name;
    } else {
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

        if (!playerData) {
            return null;
        } else if (playerData.id || playerData.name) {
            return playerData;
        } else {
            return null;
        }
    }
};
