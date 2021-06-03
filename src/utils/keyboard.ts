import { Markup } from 'telegraf'
import { appsUrl } from './env'

export const loadMoreNotif = Markup.inlineKeyboard([
	Markup.callbackButton('🔔 Load more', 'loadMoreNotifs')
])

export const settingsKeyboard = (isOnNotifs: boolean, isOnFeed: boolean) => {
	const checkMarkFeeds = isOnFeed ? '✅ Live feed updates enabled' : '❌ Live feed updates disabled'
	const checkMarkNotifs = isOnNotifs ? '✅ Live notifications enabled' : '❌ Live notifications disabled'

	return Markup.inlineKeyboard([
		Markup.callbackButton(`${checkMarkFeeds}`, 'pushFeeds'),
		Markup.callbackButton(`${checkMarkNotifs}`, 'pushNotifs')
	])
}

export const profileButton = (account: string) => Markup.inlineKeyboard([
	[
		Markup.urlButton('View on site', `${appsUrl}/accounts/${account}`),
		Markup.urlButton('Edit profile', `${appsUrl}/accounts/edit`),
	],
	[
		Markup.callbackButton('Switch account', 'switchAccount'),
		Markup.callbackButton('Sign out', 'signOut')
	]
]).resize()

export const signIn = Markup.keyboard([
	Markup.callbackButton('Sign in', 'signIn')
]).resize()

export const mainMenuKeyboard = Markup.keyboard([
  ['📰 Feed', '🔔 Notifications'],
  ['👤 Account', '⚙️ Settings']
]).resize()

export const loadMoreFeed = Markup.inlineKeyboard([
	Markup.callbackButton('📰 Load more', 'loadMoreFeeds'),
])
