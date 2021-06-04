import { ApiPromise } from '@polkadot/api'
import { ipfsReadOnly, offchainUrl, substrateUrl } from '../utils/env'
import { SubsocialApi, SubsocialSubstrateApi, SubsocialIpfsApi, Api } from '@subsocial/api'

export let api: ApiPromise
export let subsocial: SubsocialApi
export let substrate: SubsocialSubstrateApi
export let ipfs: SubsocialIpfsApi

export const resolveSubsocialApi = async () => {

	if (!subsocial) {
		api = await Api.connect(substrateUrl)
		subsocial = new SubsocialApi({
			substrateApi: api,
			ipfsNodeUrl: ipfsReadOnly,
			offchainUrl
		})

		substrate = subsocial.substrate
		ipfs = subsocial.ipfs
	}

	return subsocial
}
