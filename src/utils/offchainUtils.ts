import axios from 'axios'
import { newLogger } from '@subsocial/utils'
import { Activity } from '@subsocial/types'
import { offchainUrl } from './env'
require('dotenv').config()

const log = newLogger('TelegramRequests')

function getOffchainUrl(subUrl: string): string {
  return `${offchainUrl}/v1/offchain${subUrl}`
}

const createActivitiesUrlByAddress = (address: string, entity: 'feed' | 'notifications' | 'activities') =>
  getOffchainUrl(`/${entity}/${address}`)

const createNotificationsUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'notifications')
const createFeedUrlByAddress = (address: string) => createActivitiesUrlByAddress(address, 'feed')

const axiosRequest = async (url: string) => {
  try {
    const res = await axios.get(url)
    if (res.status !== 200) {
      log.error('Failed request to offchain with status', res.status)
    }

    return res
  } catch (err) {
    log.error('Failed request to offchain with error', err)
    return err
  }
}

const getActivity = async (url: string, offset: number, limit: number): Promise<Activity[]> => {
  try {
    const res = await axiosRequest(`${url}?offset=${offset}&limit=${limit}`)
    const { data } = res
    return data
  } catch (err) {
    log.error('Failed get activities from offchain with error', err)
    return []
  }
}

export const getNewsFeed = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createFeedUrlByAddress(myAddress), offset, limit)


export const getNotifications = async (myAddress: string, offset: number, limit: number): Promise<Activity[]> =>
  getActivity(createNotificationsUrlByAddress(myAddress), offset, limit)

export const setTelegramData = async (account: string, chatId: number) => {
  try {
    const res = await axios.post(getOffchainUrl(`/telegram//setTelegramData`), { account, chatId })
    if (res.status !== 200) {
      console.warn('Failed to insert telegram data for account:', account, 'res.status:', res.status)
    }
  } catch (err) {
    console.error(`Failed to insert telegram data for account: ${account}`, err)
  }
}

export const changeCurrentAccount = async (account: string, chatId: number) => {
  try {
    const res = await axios.post(getOffchainUrl(`/telegram/setCurrentAccount`), { account, chatId })
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Failed to chenge current account for chat id: ${chatId}`, err)
  }
}

export const updateLastPush = async (account: string, chatId: number, blockNumber: string, eventIndex: number) => {
  try {
    const res = await axios.post(getOffchainUrl(`/telegram/setLastPush`), { account, chatId, blockNumber, eventIndex })
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Failed to update last push for chat id: ${chatId}`, err)
  }
}

export const getAccountByChatId = async (chatId: number) => {
  try {
    const res = await axios.get(getOffchainUrl(`/telegram/getAccountByChatId/${chatId}`))
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Failed to get account for chat id: ${chatId}`, err)
  }
}

export const getTelegramChat = async (account: string, chatId: number) => {
  try {
    const res = await axios.get(getOffchainUrl(`/telegram/getTelegramChat?account=${account}&chatId=${chatId}`))
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Failed to get data for telegram for chat id: ${chatId}`, err)
  }
}

export const updateTelegramChat = async (account: string, chatId: number, push_notifs: boolean, push_feeds: boolean) => {
  try {
    const res = await axios.post(getOffchainUrl(`/telegram/updateTelegramChat`), { account, chatId, push_notifs, push_feeds })
    if (res.status === 200) {
      return res.data
    }
  } catch (err) {
    console.error(`Failed to get data for telegram for chat id: ${chatId}`, err)
  }
}