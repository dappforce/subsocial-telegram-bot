import { setTelegramData, changeCurrentAccount } from './utils/offchainUtils';
import { encodeAddress } from '@polkadot/util-crypto';
import { GenericAccountId } from '@polkadot/types';
import registry from '@subsocial/types/substrate/registry'
import { mainMenuKeyboard } from './utils/index';
const Scene = require('telegraf/scenes/base')

export class SceneGenerator {
	getAccountScene() {
		const scene = new Scene('address')
		scene.enter(async (ctx) => {
			await ctx.reply("Write your address on Subsocial: ")
		})
		scene.on('text', async (ctx) => {
			const chatId = ctx.chat.id
			const message = ctx.message.text
			try {
				const addressDecoded = new GenericAccountId(registry, message).toHex()
				const addressEncoded = encodeAddress(addressDecoded, 28).toString()
				
				await setTelegramData(addressEncoded, chatId)
				await changeCurrentAccount(addressEncoded, chatId)

				await ctx.reply(`Thank you account confirmed`, {reply_markup: mainMenuKeyboard})

				ctx.chat.first_name = message
				await ctx.scene.leave()
			} catch {
				await ctx.reply(`Opps! Account is not valid:`)
				ctx.scene.reenter()
			}
		})
		return scene
	}
}
