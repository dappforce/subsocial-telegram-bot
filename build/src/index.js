"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMenuKeyboard = exports.bot = void 0;
const telegram_keyboard_1 = require("telegram-keyboard");
const scenes_1 = require("./scenes");
const env_1 = require("./env");
const Feed_1 = require("./Feed/Feed");
const Notifications_1 = require("./Notifications/Notifications");
const ws_1 = require("./ws");
const Profile_1 = require("./Profile/Profile");
const settings_1 = require("./Settings/settings");
const utils_1 = require("./utils/utils");
const Telegraf = require('telegraf');
const { Stage, session } = Telegraf;
exports.bot = new Telegraf(env_1.TOKEN);
exports.bot.catch((err, ctx) => {
    utils_1.log.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});
let notifOffset = 0;
let feedOffset = 0;
exports.mainMenuKeyboard = telegram_keyboard_1.Keyboard.make([
    ['📰 Feed', '🔔 Notifications'],
    ['👤 Account', '⚙️ Settings']
]).reply();
const scenesGen = new scenes_1.SceneGenerator();
const getBalance = scenesGen.getAccountScene();
const stage = new Stage([getBalance]);
exports.bot.use(session());
exports.bot.use(stage.middleware());
exports.bot.start(async (ctx) => {
    await ctx.telegram.sendMessage(ctx.chat.id, 'Hi in Subsocial telegram bot👋');
    await ctx.scene.enter('address');
});
ws_1.resloveWebSocketConnection();
exports.bot.hears('🔔 Notifications', async (ctx) => {
    notifOffset = 0;
    notifOffset = await Notifications_1.showNotification(ctx, notifOffset);
});
exports.bot.action('loadMoreNotifs', async (ctx) => {
    notifOffset = await Notifications_1.showNotification(ctx, notifOffset);
});
exports.bot.hears('📰 Feed', async (ctx) => {
    feedOffset = 0;
    feedOffset = await Feed_1.showFeed(ctx, feedOffset);
});
exports.bot.action('loadMoreFeeds', async (ctx) => {
    feedOffset = await Feed_1.showFeed(ctx, feedOffset);
});
exports.bot.hears('👤 Account', async (ctx) => {
    await Profile_1.showProfile(ctx);
});
exports.bot.action('switchAccount', async (ctx) => {
    await Profile_1.switchAccount(ctx);
});
exports.bot.action('signOut', async (ctx) => {
    await Profile_1.signOut(ctx);
});
exports.bot.hears('⚙️ Settings', async (ctx) => {
    await settings_1.showSettings(ctx);
});
exports.bot.action('pushFeeds', async (ctx) => {
    await settings_1.manageSettings(ctx, 'feed');
});
exports.bot.action('pushNotifs', async (ctx) => {
    await settings_1.manageSettings(ctx, 'notification');
});
exports.bot.hears('Sign in', async (ctx) => {
    ctx.scene.enter('address');
});
exports.bot.on('new_chat_members', async (ctx) => {
    ctx.telegram.leaveChat(ctx.chat.id);
});
exports.bot.launch();
//# sourceMappingURL=index.js.map