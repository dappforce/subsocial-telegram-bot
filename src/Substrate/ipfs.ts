import { ipfsReadOnly } from '../utils/env'

const getPath = (cid: string) => `ipfs/${cid}`

export const resolveIpfsUrl = (cid: string) => {
  try {
    return `${ipfsReadOnly}/${getPath(cid)}`
  } catch (err) {
    return cid
  }
}