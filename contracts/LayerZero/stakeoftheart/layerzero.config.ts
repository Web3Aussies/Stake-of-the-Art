import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepGallery: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'Gallery',
}

const amoyCurator: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'Curator',
}

const worldGallery: OmniPointHardhat = {
    eid: EndpointId.WORLDCOIN_V2_TESTNET,
    contractName: 'Gallery',
}

const amoyCollection: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'Collection',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: amoyCurator,
        },
        {
            contract: sepGallery,
        },
        {
            contract: worldGallery,
        },
        {
            contract: amoyCollection,
        },
    ],
    connections: [
        {
            from: amoyCurator,
            to: sepGallery,
        },
        {
            from: sepGallery,
            to: amoyCurator,
        },
        {
            from: sepGallery,
            to: amoyCollection,
        },
        {
            from: amoyCollection,
            to: sepGallery,
        },
        {
            from: amoyCurator,
            to: worldGallery,
            // config: {
            //     sendConfig: {
            //             executorConfig: {
            //                 maxMessageSize: 99,
            //                 executor: '0x4Cf1B3Fa61465c2c907f82fC488B43223BA0CF93'
            //             },
            //             ulnConfig: {
            //                 requiredDVNs: ['0x55c175dd5b039331db251424538169d8495c18d1'],
            //             }
            //     },
            //     receiveConfig: {
            //         ulnConfig: {
            //             requiredDVNs: ['0x55c175dd5b039331db251424538169d8495c18d1'],
            //         }
            //     }                                
            // }
        }
        // {
        //     from: gallery,
        //     to: amoyCurator,
        // },
        // {
        //     from: worldGallery,
        //     to: amoyCurator,
        // },
    ],
}

export default config
