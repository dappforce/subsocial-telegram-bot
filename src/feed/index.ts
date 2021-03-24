import { resolveSubsocialApi } from '../Substrate/subsocialConnect';
import {
	createHrefForPost,
	createMessageForFeeds,
	createHrefForAccount,
	createHrefForSpace,
} from '../utils';
import { getAccountByChatId, getNewsFeed } from '../utils/offchainUtils';
import { TelegrafContext } from 'telegraf/typings/context';
import { Markup } from 'telegraf';
import { PostWithAllDetails } from '@subsocial/types';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { isDef, nonEmptyStr } from '@subsocial/utils';
import BN from 'bn.js';
import { mainMenuKeyboard } from '../utils/index';
dayjs.extend(LocalizedFormat)


const loadMoreFeed = Markup.inlineKeyboard([
	Markup.callbackButton('📰 Load more', 'loadMoreFeeds'),
])

export const getPostPreview = ({ post, space, owner }: PostWithAllDetails): string => {
	const { space_id, id: post_id, created: { time } } = post.struct
	const formatDate = dayjs(time.toNumber()).format('lll')

	const account = owner.struct.id.toString()

	const spaceId = post.struct.space_id
	const content = post.content.body

	const accountName = owner.content?.name
	const spaceName = space.content?.name

	const accountUrl = createHrefForAccount(account, accountName)
	const spaceUrl = createHrefForSpace(space_id.unwrap().toString(), spaceName)
	const url = createHrefForPost(spaceId.toString(), post_id.toString(), content)

	return createMessageForFeeds(url, accountUrl, spaceUrl, formatDate)
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
			posts.forEach(async (post, i) => {
				if (i == postLength - 1)
					ctx.reply(getPostPreview(post), {
						parse_mode: 'HTML',
						reply_markup: loadMoreFeed
					})
				else
					ctx.reply(getPostPreview(post), { parse_mode: 'HTML' })
			})
			feedOffset += 5
		} else {
			feedOffset = 0
			ctx.reply("No more feed🤷‍♂️", { reply_markup: mainMenuKeyboard })
		}
	}
	return feedOffset
}