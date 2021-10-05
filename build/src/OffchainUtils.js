"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountByChatId = exports.setTelegramData = exports.getNotifications = exports.getNewsFeed = void 0;
const axios_1 = require("axios");
const utils_1 = require("@subsocial/utils");
const env_1 = require("./env");
require('dotenv').config();
const log = utils_1.newLogger('TelegramRequests');
function getOffchainUrl(subUrl) {
    return `${env_1.offchainUrl}/v1/offchain${subUrl}`;
}
const createActivitiesUrlByAddress = (address, entity) => getOffchainUrl(`/${entity}/${address}`);
const createNotificationsUrlByAddress = (address) => createActivitiesUrlByAddress(address, 'notifications');
const createFeedUrlByAddress = (address) => createActivitiesUrlByAddress(address, 'feed');
const axiosRequest = async (url) => {
    try {
        const res = await axios_1.default.get(url);
        if (res.status !== 200) {
            log.error('Failed request to offchain with status', res.status);
        }
        return res;
    }
    catch (err) {
        log.error('Failed request to offchain with error', err);
        return err;
    }
};
const getActivity = async (url, offset, limit) => {
    try {
        const res = await axiosRequest(`${url}?offset=${offset}&limit=${limit}`);
        const { data } = res;
        return data;
    }
    catch (err) {
        log.error('Failed get activities from offchain with error', err);
        return [];
    }
};
exports.getNewsFeed = async (myAddress, offset, limit) => getActivity(createFeedUrlByAddress(myAddress), offset, limit);
exports.getNotifications = async (myAddress, offset, limit) => getActivity(createNotificationsUrlByAddress(myAddress), offset, limit);
exports.setTelegramData = async (account, chatId) => {
    try {
        const res = await axios_1.default.post(getOffchainUrl(`/notifications/setTelegramData`), { account, chatId });
        if (res.status !== 200) {
            console.warn('Failed to insert telegram data for account:', account, 'res.status:', res.status);
        }
    }
    catch (err) {
        console.error(`Failed to insert telegram data for account: ${account}`, err);
    }
};
exports.getAccountByChatId = async (chatId) => {
    try {
        const res = await axios_1.default.get(getOffchainUrl(`/notifications/getAccountByChatId/${chatId}`));
        if (res.status === 200) {
            return res.data;
        }
    }
    catch (err) {
        console.error(`Failed to get account for chat id: ${chatId}`, err);
    }
};
//# sourceMappingURL=OffchainUtils.js.map