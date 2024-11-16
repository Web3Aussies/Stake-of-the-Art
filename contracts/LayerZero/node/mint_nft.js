const { PinataSDK } = require("pinata-web3")
const fs = require("fs")
require("dotenv").config()
// Import necessary packages
const { createPublicClient, createWalletClient, http, parseAbi, stringify, encodeFunctionData } = require('viem');
const { polygonAmoy } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const { RateLimiter } = require('limiter');

// Configurable parameters
const nftContractAddress = "0xF6870B60B1e8aA601c6a0C8e9792EdacAb450f59";
const sampleRecipient = "0xaaB63b70Ad1fcFf67EB26963EB352C91945B01e2";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
})

// For each NFT, we need a metadata file with the name, description, and image URL
const sampleNFTMetadata = {
    name: "Beef Noodle Soup",
    description: "Hot and spicy beef noodle soup",
    image: "https://beige-registered-ocelot-399.mypinata.cloud/ipfs/QmZJ7oJqW9x6Q4Z2y6J5Zv1ZcX8J6VY8Z",
};

// The CID of the metadata fill will be added to the NFT token during minting


// Here is my upload function to Pinata in case yo uneed it
// async function upload(nft) {
//     try {
//         // Upload Image
//         const imageBlob = new Blob([fs.readFileSync(`./images/${nft.image}.jpeg`)]);
//         const imageFile = new File([imageBlob], `${nft.image}.jpeg`, { type: "image/jpeg" })
//         const imageUpload = await pinata.upload.file(imageFile);
//         console.log("Image Uploaded");
//         console.log(imageUpload)

//         const metadata = {
//             name: nft.name,
//             description: nft.description,
//             image: `https://beige-registered-ocelot-399.mypinata.cloud/ipfs/${imageUpload.IpfsHash}`
//         }
//         const metaBlob = new Blob([JSON.stringify(metadata)]);
//         const metaFile = new File([metaBlob], `${nft.image}.json`, { type: "text/json" })
//         const metaUpload = await pinata.upload.file(metaFile);

//         console.log("Metadata Uploaded");
//         console.log(metaUpload)
//         return metaUpload

//     } catch (error) {
//         console.log(error)
//         return null
//     }
// }

// Replace with your RPC URL (e.g., Infura, Alchemy, or a local node)
const rpcUrl = `https://polygon-amoy.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;

// Replace with your private key (never share your private key)
const privateKey = process.env.WALLET_PRIVATE_KEY;

// Set up your wallet client
const walletClient = createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: polygonAmoy,
    transport: http(rpcUrl),
});

// Replace with your contract address and ABI
const contractAbi = parseAbi([
    // Replace with the actual ABI of the safeMint function
    "function safeMint(address to, string memory uri)"
]);


const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(rpcUrl),
});


// Takes in the response from the upload function and mints the token using the hash of the metadata file
async function mintToken(metaUpload) {
    try {
        // Define the transaction data
        const transactionData = {
            to: nftContractAddress,
            data: encodeFunctionData({
                abi: contractAbi,
                functionName: "safeMint",
                args: [sampleRecipient
                    , metaUpload.IpfsHash],
            }),
        };

        // Send the transaction
        const transactionHash = await walletClient.sendTransaction(transactionData);
        console.log(`Transaction sent! Hash: ${transactionHash}`);

        // Wait for the transaction to be minted
        // Don't know why this call does not finish
        // const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
        // console.log("Transaction confirmed:", stringify(receipt));
    } catch (error) {
        console.error("Error while minting token:", error);
    }
}
