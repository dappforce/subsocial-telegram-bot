"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signOut = exports.switchAccount = exports.showProfile = void 0;
const OffchainUtils_1 = require("../utils/OffchainUtils");
const subsocialConnect_1 = require("../Substrate/subsocialConnect");
const utils_1 = require("../utils/utils");
const util_1 = require("@polkadot/util");
const telegraf_1 = require("telegraf");
const env_1 = require("../env");
const profileButton = (account) => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.urlButton('View on site', `${env_1.appsUrl}/accounts/${account}`),
        telegraf_1.Markup.urlButton('Edit profile', `${env_1.appsUrl}/accounts/edit`)
    ],
    [
        telegraf_1.Markup.callbackButton('Switch account', 'switchAccount'),
        telegraf_1.Markup.callbackButton('Sign out', 'signOut')
    ]
]);
const signIn = telegraf_1.Markup.keyboard([
    telegraf_1.Markup.callbackButton('Sign in', 'signIn')
]).resize();
exports.showProfile = async (ctx) => {
    var _a;
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const account = await OffchainUtils_1.getAccountByChatId(ctx.chat.id);
    const balance = await subsocialConnect_1.api.derive.balances.all(account);
    const profile = await subsocial.findProfile(account);
    const accountName = ((_a = profile === null || profile === void 0 ? void 0 : profile.content) === null || _a === void 0 ? void 0 : _a.name) || '';
    const reputation = (profile === null || profile === void 0 ? void 0 : profile.struct.reputation.toNumber()) || 0;
    const followers_count = (profile === null || profile === void 0 ? void 0 : profile.struct.followers_count.toNumber()) || 0;
    const following_accounts_count = (profile === null || profile === void 0 ? void 0 : profile.struct.following_accounts_count.toNumber()) || 0;
    const freeBalance = util_1.formatBalance(balance.freeBalance.toString());
    const message = utils_1.createMessageForProfile(accountName, account, freeBalance, reputation, following_accounts_count, followers_count);
    ctx.telegram.sendMessage(ctx.chat.id, message, { parse_mode: 'HTML', reply_markup: profileButton(account) });
};
exports.switchAccount = async (ctx) => {
    await OffchainUtils_1.changeCurrentAccount('', ctx.chat.id);
    ctx.scene.enter('address');
};
exports.signOut = async (ctx) => {
    const chatId = ctx.chat.id;
    await OffchainUtils_1.changeCurrentAccount('', chatId);
    await ctx.telegram.sendMessage(chatId, 'You are sign out', { reply_markup: signIn });
};
//# sourceMappingURL=Profile.js.map