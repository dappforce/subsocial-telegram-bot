"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showFeed = exports.getPostPreview = void 0;
const subsocialConnect_1 = require("../Substrate/subsocialConnect");
const utils_1 = require("../utils/utils");
const OffchainUtils_1 = require("../utils/OffchainUtils");
const telegraf_1 = require("telegraf");
const index_1 = require("../index");
const loadMoreFeed = telegraf_1.Markup.inlineKeyboard([
    telegraf_1.Markup.callbackButton('📰 Load more', 'loadMoreFeeds'),
]);
exports.getPostPreview = async (feed) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const { date, post_id, account, space_id } = feed;
    const formatDate = new Date(date).toUTCString();
    const post = await subsocial.findPost({ id: post_id });
    const spaceId = post.struct.space_id;
    const content = post.content.body;
    const accountName = await utils_1.getAccountName(account);
    const spaceName = await utils_1.getSpaceName(space_id);
    const accountUrl = utils_1.createHrefForAccount(account, accountName);
    const spaceUrl = utils_1.createHrefForSpace(space_id, spaceName);
    const url = utils_1.createHrefForPost(spaceId.toString(), post_id.toString(), content);
    return utils_1.createMessageForFeeds(url, accountUrl, spaceUrl, formatDate);
};
exports.showFeed = async (ctx, feedOffset) => {
    const account = await OffchainUtils_1.getAccountByChatId(ctx.chat.id);
    if (account) {
        const feeds = await OffchainUtils_1.getNewsFeed(account, feedOffset, 5);
        if (feeds.length) {
            for (let i = 0; i < feeds.length; i++) {
                const feed = feeds[i];
                if (i == feeds.length - 1)
                    await ctx.telegram.sendMessage(ctx.chat.id, await exports.getPostPreview(feed), {
                        parse_mode: 'HTML',
                        reply_markup: loadMoreFeed
                    });
                else
                    await ctx.telegram.sendMessage(ctx.chat.id, await exports.getPostPreview(feed), { parse_mode: 'HTML' });
            }
            feedOffset += 5;
        }
        else {
            feedOffset = 0;
            ctx.reply("No more feed🤷‍♂️", index_1.mainMenuKeyboard);
        }
    }
    return feedOffset;
};
//# sourceMappingURL=Feed.js.map