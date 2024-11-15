import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const amoyContract: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'Collection',
}

const worldContract: OmniPointHardhat = {
    eid: EndpointId.WORLDCOIN_V2_TESTNET,
    contractName: 'Collection',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: worldContract,
        },
        {
            contract: amoyContract,
        },
    ],
    connections: [
        {
            from: worldContract,
            to: amoyContract,
        },
        {
            from: amoyContract,
            to: worldContract,
        },
    ],
}

export default config
