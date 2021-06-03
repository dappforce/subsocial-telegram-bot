import { appsUrl } from './env'
import { newLogger, pluralize } from '@subsocial/utils'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import dayjs from 'dayjs'
import { AnyAccountId } from '@subsocial/types'
dayjs.extend(LocalizedFormat)

export type MessageForNotifsType = {
	date: string,
	account: string,
	msg: string,
	link: string,
	aggregated: boolean,
	aggCount: number
}

export const log = newLogger("Telegram")

export type Type = 'notification' | 'feed'

export const createHrefForPost = (spaceId: string, postId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}/${postId}">${name}</a>`
}

export const createHrefForSpace = (spaceId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}">${name}</a>`
}

export const createHrefForAccount = (followingId: string, name: string) => {
	return `<a href="${appsUrl}/accounts/${followingId}">${name}</a>`
}

export const createMessageForNotifs = ({ date, account, msg, link, aggregated, aggCount }: MessageForNotifsType) => {
	const aggregatedMsg = aggregated && aggCount > 0 ? ` and ${pluralize(aggCount, 'other person', 'other people')} ` : ''

	return `${account}${aggregatedMsg} <b>${msg}</b> ${link}\n${date}`
}

export const createMessageForFeeds = (link: string, account: string, spaceName: string, date: string) => {
	return `${link}\nPosted by ${account} in space ${spaceName}\n${date}`
}

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString()

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address
}

export const createMessageForProfile = (
	accountName: string,
	address: string,
	balance: string,
	followings: number,
	followers: number
) => {
	return `<b>👤 Account</b>

	🙂 Name: ${accountName}
	🔑 Address: ${address}
	💰 Balance: ${balance}
	⬆️ My followings: ${followings}
	⬇️ My followers: ${followers}`
}

export const getFormatDate = (date: string | number) => {
	return dayjs(date).format('lll')
}