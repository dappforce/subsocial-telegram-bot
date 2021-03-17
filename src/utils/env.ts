import * as dotenv from 'dotenv'
dotenv.config()

export const TOKEN = process.env.BOT_TOKEN

export const substrateUrl = process.env.SUBSTRATE_WS

export const offchainUrl = process.env.OFFCHAIN_URL

export const offchainWs = process.env.OFFCHAIN_TELEGRAM_WS

export const ipfsReadOnly = process.env.IPFS_READONLY_URL

export const appsUrl = process.env.APP_BASE_URL
