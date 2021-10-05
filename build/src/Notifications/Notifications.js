"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showNotification = exports.createNotificationsMessage = void 0;
const OffchainUtils_1 = require("../utils/OffchainUtils");
const message_1 = require("./message");
const subsocialConnect_1 = require("../Substrate/subsocialConnect");
const utils_1 = require("../utils/utils");
const telegraf_1 = require("telegraf");
const index_1 = require("../index");
const loadMoreNotif = telegraf_1.Markup.inlineKeyboard([
    telegraf_1.Markup.callbackButton('🔔 Load more', 'loadMoreNotifs')
]);
exports.createNotificationsMessage = async (activities) => {
    let res = [];
    for (let index = 0; index < activities.length; index++) {
        const activity = activities[index];
        const str = message_1.default.notifications[activity.event];
        res.push(await getActivityPreview(activity, str));
    }
    return res;
};
const getActivityPreview = async (activity, msg) => {
    const { account, event, space_id, post_id, comment_id, following_id, date } = activity;
    const eventName = event;
    switch (eventName) {
        case 'AccountFollowed': return getAccountPreview(account, following_id, msg, date);
        case 'SpaceFollowed': return getSpacePreview(account, space_id, msg, date);
        case 'SpaceCreated': return getSpacePreview(account, space_id, msg, date);
        case 'CommentCreated': return getCommentPreview(account, comment_id, msg, date);
        case 'CommentReplyCreated': return getCommentPreview(account, comment_id, msg, date);
        case 'PostShared': return getPostPreview(account, post_id, msg, date);
        case 'CommentShared': return getCommentPreview(account, comment_id, msg, date);
        case 'PostReactionCreated': return getPostPreview(account, post_id, msg, date);
        case 'CommentReactionCreated': return getCommentPreview(account, comment_id, msg, date);
        case 'PostCreated': return getPostPreview(account, post_id, msg, date);
        default: return undefined;
    }
};
const getAccountPreview = async (account, following_id, msg, date) => {
    const formatDate = new Date(date).toUTCString();
    const followingName = await utils_1.getAccountName(following_id);
    const accountName = await utils_1.getAccountName(account);
    const followingUrl = utils_1.createHrefForAccount(following_id, followingName);
    const accountUrl = utils_1.createHrefForAccount(account, accountName);
    return utils_1.createMessageForNotifs(formatDate, accountUrl, msg, followingUrl);
};
const getSpacePreview = async (account, spaceId, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const space = await subsocial.findSpace({ id: spaceId });
    const content = space.content.name;
    const accountName = await utils_1.getAccountName(account);
    const url = utils_1.createHrefForSpace(spaceId.toString(), content);
    return utils_1.createMessageForNotifs(formatDate, utils_1.createHrefForAccount(account, accountName), msg, url);
};
const getCommentPreview = async (account, comment_id, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const postDetails = await subsocial.findPostWithSomeDetails({ id: comment_id, withSpace: true });
    const postId = postDetails.post.struct.id;
    const spaceId = postDetails.space.struct.id;
    const content = postDetails.ext.post.content.body;
    const accountName = await utils_1.getAccountName(account);
    const url = utils_1.createHrefForPost(spaceId.toString(), postId.toString(), content);
    return utils_1.createMessageForNotifs(formatDate, utils_1.createHrefForAccount(account, accountName), msg, url);
};
const getPostPreview = async (account, postId, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const post = await subsocial.findPost({ id: postId });
    const spaceId = post.struct.space_id;
    const content = post.content.body;
    const accountName = await utils_1.getAccountName(account);
    const url = utils_1.createHrefForPost(spaceId.toString(), postId.toString(), content);
    return utils_1.createMessageForNotifs(formatDate, utils_1.createHrefForAccount(account, accountName), msg, url);
};
exports.showNotification = async (ctx, notifOffset) => {
    const account = await OffchainUtils_1.getAccountByChatId(ctx.chat.id);
    if (account) {
        const notifs = await OffchainUtils_1.getNotifications(account, notifOffset, 5);
        const notifsMessage = await exports.createNotificationsMessage(notifs);
        if (notifsMessage.length) {
            for (let i = 0; i < notifsMessage.length; i++) {
                const notification = notifsMessage[i];
                if (i == notifsMessage.length - 1)
                    await ctx.telegram.sendMessage(ctx.chat.id, notification, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: loadMoreNotif
                    });
                else
                    await ctx.telegram.sendMessage(ctx.chat.id, notification, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    });
            }
            notifOffset += 5;
        }
        else {
            notifOffset = 0;
            ctx.reply("No more notifications🤷‍♂️", index_1.mainMenuKeyboard);
        }
    }
    return notifOffset;
};
//# sourceMappingURL=Notifications.js.map