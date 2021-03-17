import { Keyboard } from 'telegram-keyboard'
import { SceneGenerator } from './scenes';
import { TOKEN } from './utils/env';
import { showFeed } from './Feed';
import { TelegrafContext } from 'telegraf/typings/context';
import { showNotification } from './Notifications';
import { resloveWebSocketConnection } from './webSocket';
import { showProfile, switchAccount, signOut } from './Profile';
import { showSettings, manageSettings } from './Settings';
import { log } from './utils';

const Telegraf = require('telegraf')
const {
  Stage,
  session
} = Telegraf

export const bot = new Telegraf(TOKEN)

bot.catch((err, ctx) => {
  log.error(`Ooops, encountered an error for ${ctx.updateType}`, err)
})

// bot.use(Telegraf.log())

let notifOffset = 0
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
  await ctx.telegram.sendMessage(ctx.chat.id, 'Hi in Subsocial telegram bot👋')

  await ctx.scene.enter('address')
})

resloveWebSocketConnection()

bot.hears('🔔 Notifications', async (ctx) => {
  notifOffset = 0
  notifOffset = await showNotification(ctx, notifOffset)
})

bot.action('loadMoreNotifs', async (ctx) => {
  notifOffset = await showNotification(ctx, notifOffset)
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

bot.on('new_chat_members', async (ctx) => {
  ctx.telegram.leaveChat(ctx.chat.id)
})


bot.launch()