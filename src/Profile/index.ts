import { TelegrafContext } from 'telegraf/typings/context'
import { changeCurrentAccount, getAccountByChatId } from '../utils/offchainUtils'
import { resolveSubsocialApi } from '../utils/subsocialConnect'
import { createMessageForProfile } from '../utils'
import { formatBalance } from '@polkadot/util'
import { Markup } from 'telegraf'
import { appsUrl } from '../utils/env'

const profileButton = (account: string) => Markup.inlineKeyboard([
    [
        Markup.urlButton('View on Web dapp', `${appsUrl}/accounts/${account}`),
        Markup.urlButton('Edit profile', `${appsUrl}/accounts/edit`)
    ],
    [
        Markup.callbackButton('Switch account', 'switchAccount'),
        Markup.callbackButton('Sign out', 'signOut')
    ]
])

const signIn = Markup.keyboard([
    Markup.callbackButton('Sign in', 'signIn')
]).resize()

export const showProfile = async (ctx: TelegrafContext) => {
    const subsocial = await resolveSubsocialApi()

    const account = await getAccountByChatId(ctx.chat.id)

    const api = await subsocial.substrate.api
    const balance = await api.derive.balances.all(account)
    const profile = await subsocial.findProfile(account)

    const accountName = profile?.content?.name || ''
    // const reputation = profile?.struct.reputation.toNumber() || 0
    const followers_count = profile?.struct.followers_count.toNumber() || 0
    const following_accounts_count = profile?.struct.following_accounts_count.toNumber() || 0

    const freeBalance = formatBalance((balance as any).freeBalance.toString())
    const message = createMessageForProfile(
        accountName,
        account,
        freeBalance,
        // reputation,
        following_accounts_count,
        followers_count
    )
    ctx.telegram.sendMessage(ctx.chat.id, message, { parse_mode: 'HTML', reply_markup: profileButton(account) })
}

export const switchAccount = async (ctx) => {
    await changeCurrentAccount('', ctx.chat.id)
    await ctx.scene.enter('address')
}

export const signOut = async (ctx) => {
    const chatId = ctx.chat.id
    await changeCurrentAccount('', chatId)
    ctx.telegram.sendMessage(chatId, 'You have successfully signed out 👍', { reply_markup: signIn })
}