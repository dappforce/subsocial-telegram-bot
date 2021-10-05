import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces'
import { resolveSubsocialApi } from '../utils/subsocialConnect'
import {
    createHrefForAccount,
    createHrefForPost,
    createHrefForSpace,
    createMessageForFeeds,
    getAccountName,
    getSpaceName
} from '../utils'
import { getAccountByChatId, getNewsFeed } from '../utils/offchainUtils'
import { TelegrafContext } from 'telegraf/typings/context'
import { Markup } from 'telegraf'
import { mainMenuKeyboard } from '../index'
import { Activity } from '@subsocial/types'

const loadMoreFeed = Markup.inlineKeyboard([
    Markup.callbackButton('📰 Load more', 'loadMoreFeeds')
])

export const getPostPreview = async (feed: Activity): Promise<string> => {
    const subsocial = await resolveSubsocialApi()
    const { date, post_id, account, space_id } = feed
    const formatDate = new Date(date).toUTCString()

    const post = await subsocial.findPost({ id: post_id as unknown as PostId })
    const spaceId = post.struct.space_id
    const content = post.content.body

    const accountName = await getAccountName(account)
    const spaceName = await getSpaceName(space_id as unknown as SpaceId)

    const accountUrl = createHrefForAccount(account, accountName)
    const spaceUrl = createHrefForSpace(space_id, spaceName)
    const url = createHrefForPost(spaceId.toString(), post_id.toString(), content)

    return createMessageForFeeds(url, accountUrl, spaceUrl, formatDate)
}

export const showFeed = async (ctx: TelegrafContext, feedOffset: number) => {
    const account = await getAccountByChatId(ctx.chat.id)
    if (account) {
        const feeds = await getNewsFeed(account, feedOffset, 5)
        if (feeds.length) {
            for (let i = 0; i < feeds.length; i++) {
                const feed = feeds[i]

                if (i == feeds.length - 1) {
                    await ctx.telegram.sendMessage(ctx.chat.id, await getPostPreview(feed), {
                        parse_mode: 'HTML',
                        reply_markup: loadMoreFeed
                    })
                } else {
                    await ctx.telegram.sendMessage(ctx.chat.id, await getPostPreview(feed), { parse_mode: 'HTML' })
                }
            }

            feedOffset += 5
        } else {
            feedOffset = 0
            ctx.reply('Your feed has ended for now 🤷‍♂️', mainMenuKeyboard)
        }
    }

    return feedOffset
}