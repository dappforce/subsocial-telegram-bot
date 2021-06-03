import { EventsName, Activity, PostWithAllDetails, SpaceData, ProfileData } from '@subsocial/types'
import { getAccountByChatId, getNotifications } from '../utils/offchainUtils'
import message from './message'
import { resolveSubsocialApi } from '../Substrate/subsocialConnect'
import { createHrefForAccount, createMessageForNotifs, createHrefForSpace, createHrefForPost } from '../utils'
import { TelegrafContext } from 'telegraf/typings/context'
import BN from 'bn.js'
import { nonEmptyStr, summarizeMd } from '@subsocial/utils'
import { getFormatDate, toShortAddress } from '../utils/index'
import { loadMoreNotif, mainMenuKeyboard } from '../utils/keyboard'

export type ActivityStore = {
	spaceById: Map<string, SpaceData>,
	postById: Map<string, PostWithAllDetails>,
	ownerById: Map<string, ProfileData>
}

type PreviewCommon = {
	account: string
	msg: string
	date: string
	activityStore: ActivityStore
	aggregated: boolean
	aggCount: number
}

type AccountPreview = PreviewCommon & {
	following_id: string
}

type SpacePreview = PreviewCommon & {
	space_id: string
}

type PostPreview = PreviewCommon & {
	post_id: string
}

type CommentPreview = PreviewCommon & {
	comment_id: string
}

export const createNotificationsMessage = (activities: Activity[], activityStore: ActivityStore) => {
	let res: string[] = []

	for( const activity of activities) {
		const str = message.notifications[activity.event as EventsName]
		res.push(getActivityPreview(activity, str, activityStore))
	}

	return res
}

const getActivityPreview = (activity: Activity, msg: string, activityStore: ActivityStore): string => {
	const { account, event, space_id, post_id, comment_id, following_id, date, aggregated, agg_count: aggCount } = activity
	const eventName = event as EventsName

	switch (eventName) {
		case 'AccountFollowed': return getAccountPreview({ account, following_id, msg, date, activityStore,	aggregated, aggCount })
		case 'SpaceFollowed': return getSpacePreview({ account, space_id, msg, date, activityStore,	aggregated, aggCount })
		case 'SpaceCreated': return getSpacePreview({ account, space_id, msg, date, activityStore,	aggregated, aggCount })
		case 'CommentCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore,	aggregated, aggCount })
		case 'CommentReplyCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore,	aggregated, aggCount })
		case 'PostShared': return getPostPreview({ account, post_id, msg, date, activityStore,	aggregated, aggCount })
		case 'CommentShared': return getCommentPreview({ account, comment_id, msg, date, activityStore,	aggregated, aggCount })
		case 'PostReactionCreated': return getPostPreview({ account, post_id, msg, date, activityStore,	aggregated, aggCount })
		case 'CommentReactionCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore,	aggregated, aggCount })
		case 'PostCreated': return getPostPreview({ account, post_id, msg, date, activityStore,	aggregated, aggCount })
		default: return undefined
	}
}

const getAccountPreview = ({ account, following_id, msg, date, activityStore, aggregated, aggCount }: AccountPreview): string => {
	const { ownerById } = activityStore

	const follower = ownerById.get(account)
	const followingAccount = ownerById.get(following_id)

	const accountName = follower?.content?.name ? follower.content.name : toShortAddress(account)
	const followingName = followingAccount?.content?.name ? followingAccount.content.name : toShortAddress(following_id)

	const followingUrl = createHrefForAccount(following_id, followingName)
	const accountUrl = createHrefForAccount(account, accountName)
	return createMessageForNotifs({date: getFormatDate(date), account: accountUrl, msg, link: followingUrl, aggregated, aggCount})
}

const getSpacePreview = ({ account, space_id, msg, date, activityStore, aggregated, aggCount }: SpacePreview): string => {
	const { spaceById, ownerById } = activityStore

	const space = spaceById.get(space_id)
	const content = space.content.name

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : toShortAddress(account)

	const url = createHrefForSpace(space_id.toString(), content)

	return createMessageForNotifs({
		date: getFormatDate(date),
		account: createHrefForAccount(account, accountName),
		msg,
		link: url,
		aggregated,
		aggCount
	})
}

const getCommentPreview = ({ account, comment_id, msg, date, activityStore, aggregated, aggCount }: CommentPreview): string => {
	const { postById, ownerById } = activityStore

	const post = postById.get(comment_id)
	const postId = post.post.struct.id
	const spaceId = post.space.struct.id

	const { title, body } = post.ext.post.content
	const content = title || summarizeMd(body).summary

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : toShortAddress(account)

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

	return createMessageForNotifs({
		date: getFormatDate(date),
		account: createHrefForAccount(account, accountName),
		msg,
		link: url,
		aggregated,
		aggCount
	})
}

const getPostPreview = ({ account, post_id, msg, date, activityStore, aggregated, aggCount }: PostPreview): string => {
	const { postById, ownerById } = activityStore

	const post = postById.get(post_id)
	const spaceId = post.post.struct.space_id

	const { title, body } = post.post.content
	const content = title ? title : summarizeMd(body).summary

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : toShortAddress(account)

	const url = createHrefForPost(spaceId.toString(), post_id.toString(), content)

	return createMessageForNotifs({
		date: getFormatDate(date),
		account: createHrefForAccount(account, accountName),
		msg,
		link: url,
		aggregated,
		aggCount
	})
}

export const loadActivityStore = async (activities: Activity[]) => {
	const subsocial = await resolveSubsocialApi()

	const postById = new Map<string, PostWithAllDetails>()
	const spaceById = new Map<string, SpaceData>()
	const ownerById = new Map<string, ProfileData>()

	const ownerIds: string[] = []
	const spaceIds: BN[] = []
	const postIds: BN[] = []

	activities.forEach(({ account, space_id, post_id, comment_id }) => {
		nonEmptyStr(account) && ownerIds.push(account)
		nonEmptyStr(space_id) && spaceIds.push(new BN(space_id))
		nonEmptyStr(post_id) && postIds.push(new BN(post_id))
		nonEmptyStr(comment_id) && postIds.push(new BN(comment_id))
	})

	const ownersData = await subsocial.findProfiles(ownerIds)
	const postsData = await subsocial.findPostsWithAllDetails({ ids: postIds })
	const spacesData = await subsocial.findPublicSpaces(spaceIds)

	ownersData.map((owner) => ownerById.set(owner.struct.id.toString(), owner))
	postsData.map((post) => postById.set(post.post.struct.id.toString(), post))
	spacesData.map((space) => spaceById.set(space.struct.id.toString(), space))

	return {
		ownerById,
		postById,
		spaceById
	} as ActivityStore
}

export const showNotification = async (ctx: TelegrafContext, notifOffset: number) => {
	const account = await getAccountByChatId(ctx.chat.id)
	if (account) {
		const activities = await getNotifications(account, notifOffset, 5)
		const activityStore = await loadActivityStore(activities)
		const notifsMessage = createNotificationsMessage(activities, activityStore)

		if (notifsMessage.length) {
			for (const [i, notification] of notifsMessage.entries()) {
				if (i == notifsMessage.length - 1) {
					await ctx.reply(notification, {
						parse_mode: 'HTML',
						disable_web_page_preview: true,
						reply_markup: loadMoreNotif
					})
				} else {
					await ctx.reply(notification, {
						parse_mode: 'HTML',
						disable_web_page_preview: true
					})
				}
			}
			notifOffset += 5
		} else {
			notifOffset = 0
			await ctx.reply("No more notifications🤷‍♂️", { reply_markup: mainMenuKeyboard })
		}
	}
	return notifOffset
}