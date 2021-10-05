import { newSubsocialApi, SubsocialApi } from '@subsocial/api'
import { ipfsReadOnly, offchainUrl, substrateUrl } from './env'

export let subsocial: SubsocialApi

export const resolveSubsocialApi = async () => {
    if (!subsocial) {
        subsocial = await newSubsocialApi({
            ipfsNodeUrl: ipfsReadOnly,
            offchainUrl,
            substrateNodeUrl: substrateUrl
        })
    }

    return subsocial
}
