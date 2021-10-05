"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveIpfsUrl = void 0;
const env_1 = require("./env");
const getPath = (cid) => `ipfs/${cid}`;
exports.resolveIpfsUrl = (cid) => {
    try {
        return `${env_1.ipfsNodeUrl}/${getPath(cid)}`;
    }
    catch (err) {
        return cid;
    }
};
//# sourceMappingURL=ipfs.js.map