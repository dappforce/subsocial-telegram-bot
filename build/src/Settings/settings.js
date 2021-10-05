"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageSettings = exports.showSettings = exports.settingsKeyboard = exports.message = void 0;
const telegraf_1 = require("telegraf");
const OffchainUtils_1 = require("../utils/OffchainUtils");
exports.message = '<b>⚙️ Settings</b>'
    + '\n\nYou can turn on/off push notifications about activity related to your account.';
exports.settingsKeyboard = (isOnNotifs, isOnFeed) => {
    const checkMarkFeeds = isOnFeed ? '✅ Live feed updates enabled' : '❌ Live feed updates disabled';
    const checkMarkNotifs = isOnNotifs ? '✅ Live notifications enabled' : '❌ Live notifications disabled';
    return telegraf_1.Markup.inlineKeyboard([
        telegraf_1.Markup.callbackButton(`${checkMarkFeeds}`, 'pushFeeds'),
        telegraf_1.Markup.callbackButton(`${checkMarkNotifs}`, 'pushNotifs')
    ]);
};
exports.showSettings = async (ctx) => {
    const chatId = ctx.chat.id;
    const account = await OffchainUtils_1.getAccountByChatId(chatId);
    if (!account)
        return;
    const telegramChat = await OffchainUtils_1.getTelegramChat(account, chatId);
    const { push_notifs, push_feeds } = telegramChat;
    ctx.telegram.sendMessage(chatId, exports.message, { parse_mode: 'HTML', reply_markup: exports.settingsKeyboard(push_notifs, push_feeds) });
};
exports.manageSettings = async (ctx, type) => {
    const messageId = ctx.update.callback_query.message.message_id;
    const account = await OffchainUtils_1.getAccountByChatId(ctx.chat.id);
    if (!account)
        return;
    const telegramChat = await OffchainUtils_1.getTelegramChat(account, ctx.chat.id);
    let { push_notifs, push_feeds } = telegramChat;
    if (type == "notification")
        push_notifs = !push_notifs;
    else
        push_feeds = !push_feeds;
    const updated = await OffchainUtils_1.updateTelegramChat(account, ctx.chat.id, push_notifs, push_feeds);
    ctx.telegram.editMessageText(ctx.chat.id, messageId, '', exports.message, { parse_mode: 'HTML', reply_markup: exports.settingsKeyboard(updated.push_notifs, updated.push_feeds) });
};
//# sourceMappingURL=settings.js.map