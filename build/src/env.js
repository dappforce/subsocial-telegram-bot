"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offchainWs = exports.appsUrl = exports.substrateUrl = exports.ipfsNodeUrl = exports.offchainUrl = exports.TOKEN = void 0;
require('dotenv').config();
exports.TOKEN = process.env.TOKEN;
exports.offchainUrl = process.env.OFFCHAIN_URL;
exports.ipfsNodeUrl = process.env.IPFS_URL;
exports.substrateUrl = process.env.SUBSTRATE_URL;
exports.appsUrl = process.env.APP_BASE_URL;
exports.offchainWs = process.env.OFFCHAIN_TELEGRAM_WS;
//# sourceMappingURL=env.js.map