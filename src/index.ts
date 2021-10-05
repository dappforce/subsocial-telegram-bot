import { Keyboard } from 'telegram-keyboard'
import { SceneGenerator } from './scenes'
import { TOKEN } from './utils/env'
import { showFeed } from './Feed'
import { TelegrafContext } from 'telegraf/typings/context'
import { showNotification } from './Notifications'
import { resolveWebSocketConnection } from './webSocket'
import { showProfile, signOut, switchAccount } from './Profile'
import { manageSettings, showSettings } from './Settings'
import { log } from './utils'

const Telegraf = require('telegraf')
const {
    Stage,
    session
} = Telegraf

export const bot = new Telegraf(TOKEN)

bot.catch((err, ctx) => {
    log.error(`Oops, encountered an error for ${ctx.updateType}`, err)
})

// bot.use(Telegraf.log())

let notifsOffset = 0
let feedOffset = 0

export const mainMenuKeyboard = Keyboard.make([
    ['📰 Feed', '🔔 Notifications'],
    ['👤 Account', '⚙️ Settings']
]).reply()

const scenesGen = new SceneGenerator()
const getBalance = scenesGen.getAccountScene()

const stage = new Stage([getBalance])

bot.use(session())
bot.use(stage.middleware())

bot.start(async (ctx) => {
    await ctx.telegram.sendMessage(ctx.chat.id, 'Hi, this is Subsocial telegram bot 👋\nHappy to see you here :)')

    await ctx.scene.enter('address')
})

resolveWebSocketConnection()

bot.hears('🔔 Notifications', async (ctx) => {
    notifsOffset = 0
    notifsOffset = await showNotification(ctx, notifsOffset)
})

bot.action('loadMoreNotifs', async (ctx) => {
    notifsOffset = await showNotification(ctx, notifsOffset)
})

bot.hears('📰 Feed', async (ctx: TelegrafContext) => {
    feedOffset = 0
    feedOffset = await showFeed(ctx, feedOffset)
})

bot.action('loadMoreFeeds', async (ctx) => {
    feedOffset = await showFeed(ctx, feedOffset)
})

bot.hears('👤 Account', async (ctx) => {
    await showProfile(ctx)
})

bot.action('switchAccount', async (ctx: TelegrafContext) => {
    await switchAccount(ctx)
})

bot.action('signOut', async (ctx: TelegrafContext) => {
    await signOut(ctx)
})

bot.hears('⚙️ Settings', async (ctx) => {
    await showSettings(ctx)
})

bot.action('pushFeeds', async (ctx: TelegrafContext) => {
    await manageSettings(ctx, 'feed')
})

bot.action('pushNotifs', async (ctx: TelegrafContext) => {
    await manageSettings(ctx, 'notification')
})

bot.hears('Sign in', async (ctx) => {
    ctx.scene.enter('address')
})

bot.launch()