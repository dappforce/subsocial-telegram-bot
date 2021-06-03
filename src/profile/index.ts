import { TelegrafContext } from 'telegraf/typings/context'
import { getAccountByChatId, changeCurrentAccount } from '../utils/offchainUtils'
import { resolveSubsocialApi, api } from '../Substrate/subsocialConnect'
import { createMessageForProfile } from '../utils'
import { formatBalance } from '@polkadot/util'
import { profileButton, signIn } from '../utils/keyboard'

export const showProfile = async (ctx: TelegrafContext) => {
	const subsocial = await resolveSubsocialApi()

	const account = await getAccountByChatId(ctx.chat.id)

	const balance = await api.derive.balances.all(account)
	const profile = await subsocial.findProfile(account)

	const accountName = profile?.content?.name || ''
	const followers_count = profile?.struct.followers_count.toNumber() || 0
	const following_accounts_count = profile?.struct.following_accounts_count.toNumber() || 0

	const freeBalance = formatBalance(balance.freeBalance.toString())
	const message = createMessageForProfile(
		accountName,
		account,
		freeBalance,
		following_accounts_count,
		followers_count
	)
	await ctx.reply(message, { parse_mode: 'HTML', reply_markup: profileButton(account) })
}

export const switchAccount = async (ctx) => {
	await changeCurrentAccount('', ctx.chat.id)
	ctx.scene.enter('address')
}

export const signOut = async (ctx) => {
	const chatId = ctx.chat.id
	await changeCurrentAccount('', chatId)
	await ctx.reply('You are sign out', { reply_markup: signIn })
}