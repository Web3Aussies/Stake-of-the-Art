import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const amoyCurator: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'Curator',
}

const sepoliaCurator: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'Curator',
}

const worldGallery: OmniPointHardhat = {
    eid: EndpointId.WORLDCOIN_V2_TESTNET,
    contractName: 'Gallery',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: amoyCurator,
        },
        {
            contract: sepoliaCurator,
        },
        {
            contract: worldGallery,
        },
    ],
    connections: [
        {
            from: amoyCurator,
            to: worldGallery,
        },
        {
            from: amoyCurator,
            to: sepoliaCurator,
        },
        {
            from: sepoliaCurator,
            to: amoyCurator,
        },
        {
            from: worldGallery,
            to: amoyCurator,
        },
    ],
}

export default config
