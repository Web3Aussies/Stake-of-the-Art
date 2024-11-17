require('dotenv').config()

const { SignProtocolClient, SpMode, EvmChains } = require("@ethsign/sp-sdk");
const { privateKeyToAccount } = require("viem/accounts");

// Congifurable parameters
const hookAddress = "0x9C9eEA023D925F89846af7d850ae974357eaA33f";

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
            { name: 'owner', type: 'address' },
            { name: 'signature', type: 'string' }
        ],
        hook: hookAddress
    });
    console.log(res);
    
}

createSchema()