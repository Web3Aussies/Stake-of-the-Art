require('dotenv').config()

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

// Congifurable parameters
const hookAddress = process.argv[2];

// Set up Wallet
const privateKey = process.env.PRIVATE_KEY;
const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.polygonAmoy,
    account: privateKeyToAccount(privateKey), // Optional, depending on environment
});

// Create Schema
const createSchema = async () => {
    const res = await client.createSchema({
        name: "Stake of the Art",
        data: [
            { name: 'tokenAddress', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'rightsHolder', type: 'address' },
            { name: 'worldIDSignature', type: 'string' }
        ],
        hook: hookAddress
    });
    console.log(res);
    
}

createSchema()