import { EventsName, Activity, PostWithAllDetails, SpaceData, ProfileData } from '@subsocial/types';
import { getAccountByChatId, getNotifications } from '../utils/offchainUtils';
import message from './message';
import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import { createHrefForAccount, createMessageForNotifs, createHrefForSpace, createHrefForPost } from '../utils';
import { Markup } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import BN from 'bn.js';
import { nonEmptyStr } from '@subsocial/utils';
import { mainMenuKeyboard } from '../utils/index';
dayjs.extend(LocalizedFormat)

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

const loadMoreNotif = Markup.inlineKeyboard([
	Markup.callbackButton('🔔 Load more', 'loadMoreNotifs')
])

export const createNotificationsMessage = (activities: Activity[], activityStore: ActivityStore) => {
	let res: string[] = []
	for (let index = 0; index < activities.length; index++) {
		const activity = activities[index];
		const str = message.notifications[activity.event as EventsName]
		res.push(getActivityPreview(activity, str, activityStore))
	}
	return res
}

const getActivityPreview = (activity: Activity, msg: string, activityStore: ActivityStore): string => {
	const { account, event, space_id, post_id, comment_id, following_id, date } = activity
	const eventName = event as EventsName

	switch (eventName) {
		case 'AccountFollowed': return getAccountPreview({ account, following_id, msg, date, activityStore })
		case 'SpaceFollowed': return getSpacePreview({ account, space_id, msg, date, activityStore })
		case 'SpaceCreated': return getSpacePreview({ account, space_id, msg, date, activityStore })
		case 'CommentCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore })
		case 'CommentReplyCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore })
		case 'PostShared': return getPostPreview({ account, post_id, msg, date, activityStore })
		case 'CommentShared': return getCommentPreview({ account, comment_id, msg, date, activityStore })
		case 'PostReactionCreated': return getPostPreview({ account, post_id, msg, date, activityStore })
		case 'CommentReactionCreated': return getCommentPreview({ account, comment_id, msg, date, activityStore })
		case 'PostCreated': return getPostPreview({ account, post_id, msg, date, activityStore })
		default: return undefined
	}
}

const getAccountPreview = ({ account, following_id, msg, date, activityStore }: AccountPreview): string => {
	const { ownerById } = activityStore
	const formatDate = dayjs(date).format('lll')

	const follower = ownerById.get(account)
	const followingAccount = ownerById.get(following_id)

	const accountName = follower?.content?.name ? follower.content.name : account
	const followingName = followingAccount?.content?.name ? followingAccount.content.name : following_id

	const followingUrl = createHrefForAccount(following_id, followingName)
	const accountUrl = createHrefForAccount(account, accountName)
	return createMessageForNotifs(formatDate, accountUrl, msg, followingUrl)
}

const getSpacePreview = ({ account, space_id, msg, date, activityStore }: SpacePreview): string => {
	const { spaceById, ownerById } = activityStore
	const formatDate = dayjs(date).format('lll')
	const space = spaceById.get(space_id)
	const content = space.content.name

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : account

	const url = createHrefForSpace(space_id.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getCommentPreview = ({ account, comment_id, msg, date, activityStore }: CommentPreview): string => {
	const { postById, ownerById } = activityStore
	const formatDate = dayjs(date).format('lll')

	const post = postById.get(comment_id)
	const postId = post.post.struct.id
	const spaceId = post.space.struct.id
	const content = post.ext.post.content.body

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : account

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getPostPreview = ({ account, post_id, msg, date, activityStore }: PostPreview): string => {
	const { postById, ownerById } = activityStore
	const formatDate = dayjs(date).format('lll')

	const post = postById.get(post_id)
	const spaceId = post.post.struct.space_id
	const content = post.post.content.body

	const owner = ownerById.get(account)
	const accountName = owner?.content?.name ? owner.content.name : account

	const url = createHrefForPost(spaceId.toString(), post_id.toString(), content)

	return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
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

	const ownersData = await subsocial.findProfiles(ownerIds);
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
		const notifsMessage = await createNotificationsMessage(activities, activityStore)

		if (notifsMessage.length) {
			for (let i = 0; i < notifsMessage.length; i++) {
				const notification = notifsMessage[i]

				if (i == notifsMessage.length - 1)
					await ctx.reply(notification, {
						parse_mode: 'HTML',
						disable_web_page_preview: true,
						reply_markup: loadMoreNotif
					})
				else
					await ctx.reply(notification, {
						parse_mode: 'HTML',
						disable_web_page_preview: true
					})
			}
			notifOffset += 5
		} else {
			notifOffset = 0
			ctx.reply("No more notifications🤷‍♂️", { reply_markup: mainMenuKeyboard })
		}
	}
	return notifOffset
}