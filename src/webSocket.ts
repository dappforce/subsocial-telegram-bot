import { w3cwebsocket as W3CWebSocket, IMessageEvent } from "websocket"
import { offchainWs } from './utils/env'
import { newLogger } from '@subsocial/utils'
import { getAccountByChatId, getTelegramChat, updateLastPush } from './utils/offchainUtils'
import { createNotificationsMessage } from './notifications'
import { bot } from './index'
import { getPostPreview } from './feed'
import { Type } from './utils'
import { Activity } from '@subsocial/types'
import { resolveSubsocialApi } from './Substrate/subsocialConnect'
import BN from "bn.js"
import { loadActivityStore } from './notifications/index'

type OffchainMessage = {
	activity: Activity,
	chatIds: number[],
	type: Type
}

export const log = newLogger("Telegram WS")

export let socket: W3CWebSocket

export const resloveWebSocketConnection = () => {
	if (!socket) {
		socket = new W3CWebSocket(offchainWs)
	}
	return socket
}

const trySendMessage = async (chatId: number, message: string, disablePreview: boolean = false) => {
	await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: disablePreview }).catch(async () => {
		log.info('Bot was blocked by the user with chatId: ', chatId)
	})
}

resloveWebSocketConnection()

socket.onopen = () => {
	log.info('Connected to Notifications Web Socket')
	socket.send("hello");
	socket.onerror = (error) => { log.error('Telegram Websocket Error:', error) }
};

socket.onclose = () => {}

socket.onmessage = async (msg: IMessageEvent) => {
	const { activity, chatIds, type } = JSON.parse(msg.data.toString()) as OffchainMessage
	const chatIdsPromise = chatIds.map(async (chatId) =>  {
		const account = await getAccountByChatId(chatId)
		if (!account) return

		const subsocial = await resolveSubsocialApi()
		const { push_notifs, push_feeds } = await getTelegramChat(account, chatId)

		if (type === 'notification' && push_notifs) {
			const activityStore = await loadActivityStore([activity])
			const notifMessage = createNotificationsMessage([activity], activityStore)

			await updateLastPush(account, chatId, activity.block_number, activity.event_index)
			await trySendMessage(Number(chatId), notifMessage[0], true)
		} else if (type === 'feed' && push_feeds) {
			const post = await subsocial.findPostWithAllDetails(new BN(activity.post_id))
			const feedMessage = getPostPreview(post)

			await trySendMessage(Number(chatId), feedMessage)
		}

		log.info('Received a new value for unread notifications:', chatId)
	})

	Promise.allSettled(chatIdsPromise)
}