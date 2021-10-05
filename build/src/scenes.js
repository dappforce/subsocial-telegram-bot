"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneGenerator = void 0;
const index_1 = require("./index");
const OffchainUtils_1 = require("./utils/OffchainUtils");
const util_crypto_1 = require("@polkadot/util-crypto");
const types_1 = require("@polkadot/types");
const registry_1 = require("@subsocial/types/substrate/registry");
const Scene = require('telegraf/scenes/base');
class SceneGenerator {
    getAccountScene() {
        const scene = new Scene('address');
        scene.enter(async (ctx) => {
            await ctx.reply("Write your address on Subsocial: ");
        });
        scene.on('text', async (ctx) => {
            const chatId = ctx.chat.id;
            const message = ctx.message.text;
            try {
                const addressDecoded = new types_1.GenericAccountId(registry_1.default, message).toHex();
                const addressEncoded = util_crypto_1.encodeAddress(addressDecoded, 28).toString();
                await OffchainUtils_1.setTelegramData(addressEncoded, chatId);
                await OffchainUtils_1.changeCurrentAccount(addressEncoded, chatId);
                await ctx.reply(`Thank you account confirmed`, index_1.mainMenuKeyboard);
                ctx.chat.first_name = message;
                await ctx.scene.leave();
            }
            catch (_a) {
                await ctx.reply(`Opps! Account is not valid:`);
                ctx.scene.reenter();
            }
        });
        return scene;
    }
}
exports.SceneGenerator = SceneGenerator;
//# sourceMappingURL=scenes.js.map