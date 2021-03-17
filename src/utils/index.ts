import { appsUrl } from './env'
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { newLogger } from '@subsocial/utils';

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

export const createMessageForNotifs = (date: string, account: string, msg: string, link: string) => {
	return account + " <b>" + msg + "</b> " + link + "\n" + date
}

export const createMessageForFeeds = (link: string, account: string, spaceName: string, date: string) => {
	return link + "\n" + "Posted by " + account + " in space " + spaceName + "\n" + date
}

export const createMessageForProfile = (
	accountName: string,
	address: string,
	balance: string,
	reputation: number,
	followings: number,
	followers: number
) => {
	return "<b>👤 Account</b>"
		+ "\n\n🙂 Name: " + accountName
		+ "\n🔑 Address: " + address
		+ "\n💰 Balance: " + balance
		+ "\n📈 Reputation: " + reputation
		+ "\n⬆️ My followings: " + followings
		+ "\n⬇️ My followers: " + followers
}

export const getAccountName = async (account: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	if (profile?.content) {
		const name = profile.content.name
		return name
	}
	else return account
}

export const getSpaceName = async (spaceId: SpaceId): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const space = await subsocial.findSpace({ id: spaceId })
	if (space.content) {
		const name = space.content.name
		return name
	}
	else return ''
}