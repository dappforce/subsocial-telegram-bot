"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpaceName = exports.getAccountName = exports.createMessageForProfile = exports.createMessageForFeeds = exports.createMessageForNotifs = exports.createHrefForAccount = exports.createHrefForSpace = exports.createHrefForPost = exports.log = void 0;
const env_1 = require("../env");
const subsocialConnect_1 = require("../Substrate/subsocialConnect");
const utils_1 = require("@subsocial/utils");
exports.log = utils_1.newLogger("Telegram");
exports.createHrefForPost = (spaceId, postId, name) => {
    return `<a href="${env_1.appsUrl}/${spaceId}/${postId}">${name}</a>`;
};
exports.createHrefForSpace = (spaceId, name) => {
    return `<a href="${env_1.appsUrl}/${spaceId}">${name}</a>`;
};
exports.createHrefForAccount = (followingId, name) => {
    return `<a href="${env_1.appsUrl}/accounts/${followingId}">${name}</a>`;
};
exports.createMessageForNotifs = (date, account, msg, link) => {
    return account + " <b>" + msg + "</b> " + link + "\n" + date;
};
exports.createMessageForFeeds = (link, account, spaceName, date) => {
    return link + "\n" + "Posted by " + account + " in space " + spaceName + "\n" + date;
};
exports.createMessageForProfile = (accountName, address, balance, reputation, followings, followers) => {
    return "<b>👤 Account</b>"
        + "\n\n🙂 Name: " + accountName
        + "\n🔑 Address: " + address
        + "\n💰 Balance: " + balance
        + "\n📈 Reputation: " + reputation
        + "\n⬆️ My followings: " + followings
        + "\n⬇️ My followers: " + followers;
};
exports.getAccountName = async (account) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const profile = await subsocial.findProfile(account);
    if (profile === null || profile === void 0 ? void 0 : profile.content) {
        const name = profile.content.name;
        return name;
    }
    else
        return account;
};
exports.getSpaceName = async (spaceId) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const space = await subsocial.findSpace({ id: spaceId });
    if (space.content) {
        const name = space.content.name;
        return name;
    }
    else
        return '';
};
//# sourceMappingURL=utils.js.map