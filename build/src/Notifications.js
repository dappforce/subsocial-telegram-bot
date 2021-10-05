"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationMessage = exports.createHrefForAccount = exports.createHrefForPost = void 0;
const message_1 = require("./message");
const subsocialConnect_1 = require("./subsocialConnect");
const env_1 = require("./env");
exports.createHrefForPost = (spaceId, postId, name) => {
    return `<a href="${env_1.appsUrl}/${spaceId}/${postId}">${name}</a>`;
};
const createHrefForSpace = (spaceId, name) => {
    return `<a href="${env_1.appsUrl}/${spaceId}">${name}</a>`;
};
exports.createHrefForAccount = (followingId, name) => {
    return `<a href="${env_1.appsUrl}/accounts/${followingId}">${name}</a>`;
};
const createMessageForNotifs = (date, account, msg, link) => {
    return date + ' ' + account + " <b>" + msg + "</b> " + link + '\n';
};
const getAccountName = async (account) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const profile = await subsocial.findProfile(account);
    if (profile.content) {
        const name = profile.content.name;
        return name;
    }
    else
        return account;
};
exports.createNotificationMessage = async (activities) => {
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
        case 'SpaceFollowed': return getSpacePreviewWithMaps(account, space_id, msg, date);
        case 'SpaceCreated': return getSpacePreviewWithMaps(account, space_id, msg, date);
        case 'CommentCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date);
        case 'CommentReplyCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date);
        case 'PostShared': return getPostPreviewWithMaps(account, post_id, msg, date);
        case 'CommentShared': return getCommentPreviewWithMaps(account, comment_id, msg, date);
        case 'PostReactionCreated': return getPostPreviewWithMaps(account, post_id, msg, date);
        case 'CommentReactionCreated': return getCommentPreviewWithMaps(account, comment_id, msg, date);
        case 'PostCreated': return getPostPreviewWithMaps(account, post_id, msg, date);
        default: return undefined;
    }
};
const getAccountPreview = async (account, following_id, msg, date) => {
    const formatDate = new Date(date).toUTCString();
    const followingName = await getAccountName(following_id);
    const accountName = await getAccountName(account);
    const followingUrl = exports.createHrefForAccount(following_id, followingName);
    const accountUrl = exports.createHrefForAccount(account, accountName);
    return createMessageForNotifs(formatDate, accountUrl, msg, followingUrl);
};
const getSpacePreviewWithMaps = async (account, spaceId, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const space = await subsocial.findSpace({ id: spaceId });
    const content = space.content.name;
    const accountName = await getAccountName(account);
    const url = createHrefForSpace(spaceId.toString(), content);
    return createMessageForNotifs(formatDate, exports.createHrefForAccount(account, accountName), msg, url);
};
const getCommentPreviewWithMaps = async (account, comment_id, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const postDetails = await subsocial.findPostWithSomeDetails({ id: comment_id, withSpace: true });
    const postId = postDetails.post.struct.id;
    const spaceId = postDetails.space.struct.id;
    const content = postDetails.ext.post.content.body;
    const accountName = await getAccountName(account);
    const url = exports.createHrefForPost(spaceId.toString(), postId.toString(), content);
    return createMessageForNotifs(formatDate, exports.createHrefForAccount(account, accountName), msg, url);
};
const getPostPreviewWithMaps = async (account, postId, msg, date) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const formatDate = new Date(date).toUTCString();
    const post = await subsocial.findPost({ id: postId });
    const spaceId = post.struct.space_id;
    const content = post.content.body;
    const accountName = await getAccountName(account);
    const url = exports.createHrefForPost(spaceId.toString(), postId.toString(), content);
    return createMessageForNotifs(formatDate, exports.createHrefForAccount(account, accountName), msg, url);
};
//# sourceMappingURL=Notifications.js.map