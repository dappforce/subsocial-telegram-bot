import { resolveSubsocialApi } from '../Substrate/subsocialConnect'
import {
	createHrefForPost,
	createMessageForFeeds,
	createHrefForAccount,
	createHrefForSpace,
} from '../utils'
import { getAccountByChatId, getNewsFeed } from '../utils/offchainUtils'
import { TelegrafContext } from 'telegraf/typings/context'
import { PostWithAllDetails } from '@subsocial/types'
import { isDef, nonEmptyStr, summarizeMd } from '@subsocial/utils'
import BN from 'bn.js'
import { getFormatDate, toShortAddress } from '../utils/index'
import { mainMenuKeyboard, loadMoreFeed } from '../utils/keyboard'

export const getPostPreview = ({ post, space, owner }: PostWithAllDetails): string => {
	const { id: post_id, created: { time } } = post.struct

	const account = post.struct.owner.toString()

	const spaceId = post.struct.space_id.unwrap().toString()
	const content = post.content?.title || summarizeMd(post.content.body).summary

	const accountName = owner?.content?.name || toShortAddress(account)
	const spaceName = space.content?.name

	const accountUrl = createHrefForAccount(account, accountName)
	const spaceUrl = createHrefForSpace(spaceId, spaceName)
	const url = createHrefForPost(spaceId, post_id.toString(), content)

	return createMessageForFeeds(url, accountUrl, spaceUrl, getFormatDate(time.toNumber()))
}

export const showFeed = async (ctx: TelegrafContext, feedOffset: number) => {
	const subsocial = await resolveSubsocialApi()
	const account = await getAccountByChatId(ctx.chat.id)
	if (account) {
		const feeds = await getNewsFeed(account, feedOffset, 5)
		const postIds: BN[] = feeds.map(({ post_id }) => nonEmptyStr(post_id) ? new BN(post_id) : undefined).filter(isDef)

		const posts = await subsocial.findPostsWithAllDetails({ ids: postIds })

		const postLength = posts.length

		if (postLength) {
			for (const [i, post] of posts.entries()) {
				if (i == postLength - 1) {
					await ctx.reply(getPostPreview(post), {
						parse_mode: 'HTML',
						reply_markup: loadMoreFeed
					})
				} else {
					await ctx.reply(getPostPreview(post), { parse_mode: 'HTML' })
				}
			}

			feedOffset += 5
		} else {
			feedOffset = 0

			await ctx.reply("No more feed🤷‍♂️", { reply_markup: mainMenuKeyboard })
		}
	}
	return feedOffset
}