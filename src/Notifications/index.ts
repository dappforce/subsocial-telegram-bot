import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces'
import { Activity, EventsName } from '@subsocial/types'
import { getAccountByChatId, getNotifications } from '../utils/offchainUtils'
import message from './message'
import { resolveSubsocialApi } from '../utils/subsocialConnect'
import {
    createHrefForAccount,
    createHrefForPost,
    createHrefForSpace,
    createMessageForNotifs,
    getAccountName
} from '../utils'
import { Markup } from 'telegraf'
import { mainMenuKeyboard } from '../index'
import { TelegrafContext } from 'telegraf/typings/context'

const loadMoreNotifs = Markup.inlineKeyboard([
    Markup.callbackButton('🔔 Load more', 'loadMoreNotifs')
])

export const createNotificationsMessage = async (activities: Activity[]) => {
    let res: string[] = []
    for (let index = 0; index < activities.length; index++) {
        const activity = activities[index]
        const str = message.notifications[activity.event as EventsName]
        res.push(await getActivityPreview(activity, str))
    }
    return res
}

const getActivityPreview = async (activity: Activity, msg: string): Promise<string> => {
    const { account, event, space_id, post_id, comment_id, following_id, date } = activity
    const eventName = event as EventsName

    switch (eventName) {
        case 'AccountFollowed':
            return getAccountPreview(account, following_id, msg, date)
        case 'SpaceFollowed':
            return getSpacePreview(account, space_id, msg, date)
        case 'SpaceCreated':
            return getSpacePreview(account, space_id, msg, date)
        case 'CommentCreated':
            return getCommentPreview(account, comment_id, msg, date)
        case 'CommentReplyCreated':
            return getCommentPreview(account, comment_id, msg, date)
        case 'PostShared':
            return getPostPreview(account, post_id, msg, date)
        case 'CommentShared':
            return getCommentPreview(account, comment_id, msg, date)
        case 'PostReactionCreated':
            return getPostPreview(account, post_id, msg, date)
        case 'CommentReactionCreated':
            return getCommentPreview(account, comment_id, msg, date)
        case 'PostCreated':
            return getPostPreview(account, post_id, msg, date)
        default:
            return undefined
    }
}

const getAccountPreview = async (account: string, following_id: string, msg: string, date: string): Promise<string> => {
    const formatDate = new Date(date).toUTCString()

    const followingName = await getAccountName(following_id)
    const accountName = await getAccountName(account)

    const followingUrl = createHrefForAccount(following_id, followingName)
    const accountUrl = createHrefForAccount(account, accountName)
    return createMessageForNotifs(formatDate, accountUrl, msg, followingUrl)
}

const getSpacePreview = async (account: string, spaceId: string, msg: string, date: string): Promise<string> => {
    const subsocial = await resolveSubsocialApi()
    const formatDate = new Date(date).toUTCString()
    const space = await subsocial.findSpace({ id: spaceId as unknown as SpaceId })
    const content = space.content.name

    const accountName = await getAccountName(account)

    const url = createHrefForSpace(spaceId.toString(), content)

    return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getCommentPreview = async (account: string, comment_id: string, msg: string, date: string): Promise<string> => {
    const subsocial = await resolveSubsocialApi()
    const formatDate = new Date(date).toUTCString()

    const postDetails = await subsocial.findPostWithSomeDetails({
        id: comment_id as unknown as PostId,
        withSpace: true
    })
    const postId = postDetails.post.struct.id
    const spaceId = postDetails.space.struct.id
    const content = postDetails.ext.post.content.body

    const accountName = await getAccountName(account)

    const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

    return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

const getPostPreview = async (account: string, postId: string, msg: string, date: string): Promise<string> => {
    const subsocial = await resolveSubsocialApi()
    const formatDate = new Date(date).toUTCString()

    const post = await subsocial.findPost({ id: postId as unknown as PostId })
    const spaceId = post.struct.space_id
    const content = post.content.body

    const accountName = await getAccountName(account)

    const url = createHrefForPost(spaceId.toString(), postId.toString(), content)

    return createMessageForNotifs(formatDate, createHrefForAccount(account, accountName), msg, url)
}

export const showNotification = async (ctx: TelegrafContext, notifsOffset: number) => {
    const account = await getAccountByChatId(ctx.chat.id)
    if (account) {
        const notifs = await getNotifications(account, notifsOffset, 5)
        const notifsMessage = await createNotificationsMessage(notifs)

        if (notifsMessage.length) {
            for (let i = 0; i < notifsMessage.length; i++) {
                const notification = notifsMessage[i]

                if (i == notifsMessage.length - 1)
                    await ctx.telegram.sendMessage(ctx.chat.id, notification, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: loadMoreNotifs
                    })
                else
                    await ctx.telegram.sendMessage(ctx.chat.id, notification, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true
                    })
            }
            notifsOffset += 5
        } else {
            notifsOffset = 0
            ctx.reply('No unread notifications left 🤷‍♂️', mainMenuKeyboard)
        }
    }
    return notifsOffset
}