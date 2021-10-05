"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSubsocialApi = exports.ipfs = exports.substrate = exports.subsocial = exports.api = void 0;
const subsocial_1 = require("@subsocial/api/subsocial");
const substrateConnect_1 = require("@subsocial/api/substrateConnect");
const env_1 = require("../env");
exports.resolveSubsocialApi = async () => {
    if (!exports.subsocial) {
        exports.api = await substrateConnect_1.Api.connect(env_1.substrateUrl);
        exports.subsocial = new subsocial_1.SubsocialApi({
            substrateApi: exports.api,
            ipfsNodeUrl: env_1.ipfsNodeUrl,
            offchainUrl: env_1.offchainUrl
        });
        exports.substrate = exports.subsocial.substrate;
        exports.ipfs = exports.subsocial.ipfs;
    }
    return exports.subsocial;
};
//# sourceMappingURL=subsocialConnect.js.map