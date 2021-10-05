"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostPreview = void 0;
const subsocialConnect_1 = require("./subsocialConnect");
const Notifications_1 = require("./Notifications");
exports.getPostPreview = async (postId) => {
    const subsocial = await subsocialConnect_1.resolveSubsocialApi();
    const post = await subsocial.findPost({ id: postId });
    const spaceId = post.struct.space_id;
    const content = post.content.body;
    const url = Notifications_1.createHrefForPost(spaceId.toString(), postId.toString(), content);
    return url;
};
//# sourceMappingURL=Feed.js.map