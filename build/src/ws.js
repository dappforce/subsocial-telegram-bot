"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resloveWebSocketConnection = exports.socket = exports.log = void 0;
const websocket_1 = require("websocket");
const env_1 = require("./env");
const utils_1 = require("@subsocial/utils");
const OffchainUtils_1 = require("./utils/OffchainUtils");
const Notifications_1 = require("./Notifications/Notifications");
const index_1 = require("./index");
const Feed_1 = require("./Feed/Feed");
exports.log = utils_1.newLogger("Telegram WS");
exports.resloveWebSocketConnection = () => {
    if (!exports.socket) {
        exports.socket = new websocket_1.w3cwebsocket(env_1.offchainWs);
    }
    return exports.socket;
};
exports.resloveWebSocketConnection();
exports.socket.onopen = () => {
    exports.log.info('Connected to Notifications Counter Web Socket');
    exports.socket.send("hello");
    exports.socket.onerror = (error) => { exports.log.error('Telegram Websocket Error:', error); };
};
exports.socket.onclose = () => {
};
exports.socket.onmessage = async (msg) => {
    const { activity, chatId, type } = JSON.parse(msg.data);
    const account = await OffchainUtils_1.getAccountByChatId(chatId);
    if (!account)
        return;
    const { push_notifs, push_feeds } = await OffchainUtils_1.getTelegramChat(account, chatId);
    if (type === 'notification' && push_notifs) {
        const notifMessage = await Notifications_1.createNotificationsMessage([activity]);
        await OffchainUtils_1.updateLastPush(account, chatId, activity.block_number, activity.event_index);
        index_1.bot.telegram.sendMessage(Number(chatId), notifMessage[0], { parse_mode: 'HTML', disable_web_page_preview: true });
    }
    else if (type == 'feed' && push_feeds) {
        const feedMessage = await Feed_1.getPostPreview(activity);
        index_1.bot.telegram.sendMessage(chatId, feedMessage, { parse_mode: 'HTML' });
    }
    exports.log.info('Received a new value for unread notifications:', chatId);
};
//# sourceMappingURL=ws.js.map