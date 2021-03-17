import { TelegrafContext } from 'telegraf/typings/context';
import { Markup } from 'telegraf';
import { getAccountByChatId, getTelegramChat, updateTelegramChat } from '../utils/offchainUtils';
import { Type } from '../utils';

export const message = '<b>⚙️ Settings</b>'
	+ '\n\nYou can turn on/off push notifications about activity related to your account.'

export const settingsKeyboard = (isOnNotifs: boolean, isOnFeed: boolean) => {
	const checkMarkFeeds = isOnFeed ? '✅ Live feed updates enabled' : '❌ Live feed updates disabled'
	const checkMarkNotifs = isOnNotifs ? '✅ Live notifications enabled' : '❌ Live notifications disabled'

	return Markup.inlineKeyboard([
		Markup.callbackButton(`${checkMarkFeeds}`, 'pushFeeds'),
		Markup.callbackButton(`${checkMarkNotifs}`, 'pushNotifs')
	])
}

export const showSettings = async (ctx: TelegrafContext) => {
	const chatId = ctx.chat.id
	const account = await getAccountByChatId(chatId)
	if (!account) return

	const telegramChat = await getTelegramChat(account, chatId)
	const { push_notifs, push_feeds } = telegramChat

	ctx.telegram.sendMessage(chatId, message, {parse_mode: 'HTML', reply_markup: settingsKeyboard(push_notifs, push_feeds) })
}

export const manageSettings = async (ctx: TelegrafContext, type: Type) => {
	const messageId = ctx.update.callback_query.message.message_id
	const account = await getAccountByChatId(ctx.chat.id)
	if (!account) return

	const telegramChat = await getTelegramChat(account, ctx.chat.id)
	let { push_notifs, push_feeds } = telegramChat

	if(type == "notification") push_notifs = !push_notifs
	else push_feeds = !push_feeds

	const updated = await updateTelegramChat(account, ctx.chat.id, push_notifs, push_feeds)

	ctx.telegram.editMessageText(ctx.chat.id, messageId, '', message, { parse_mode: 'HTML', reply_markup: settingsKeyboard(updated.push_notifs, updated.push_feeds) })
}