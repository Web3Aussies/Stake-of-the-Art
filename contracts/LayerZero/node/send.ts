const { createPublicClient, createWalletClient, http, polygonAmoy, sepolia } = require("viem");
const { privateKeyToAccount } = require('viem/accounts');
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { Options } = require("@layerzerolabs/lz-v2-utilities");

// Load environment variables
dotenv.config();

const rpcUrl = process.env.RPC_URL || "";
const contractAddress = "0x452F3e5D98611588D986d54EC96401f303592d76"; // Replace with your contract address
const curator = JSON.parse(fs.readFileSync("./Curator.json", "utf-8"));
const privateKey = process.env.PRIVATE_KEY || '';
const account = privateKeyToAccount(privateKey);

// Initialize public client 
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  chain: polygonAmoy, // Replace with the target chain
  transport: http(rpcUrl),
  account,
});

async function main() {
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Block Number:", blockNumber);

  const version = await publicClient.readContract({
    address: contractAddress,
    abi: curator.abi,
    functionName: "oAppVersion",
  });

  console.log("Quote Result:", version);

  const peers = await publicClient.readContract({
    address: contractAddress,
    abi: curator.abi,
    functionName: "peers",
    args: [40161],
  });

  console.log("Peers", peers);
  

  //   console.log('Quote Result:', quoteResult);
  // } catch (error) {
  //   console.error('Error calling contract:', error);
  // }

  const dstEid = 40161; // Example destination chain ID
  const message = "Hello, LayerZero!";
  const options = Options.newOptions()
    .addExecutorLzReceiveOption(200000, 0)
    .toHex()
    .toString();

  const payInLzToken = false;
  const quoteResult = await publicClient.readContract({
    address: contractAddress,
    abi: curator.abi, // Use ABI from the Foundry JSON file
    functionName: "quote",
    args: [dstEid, message, options, payInLzToken],    
  });

  console.log("Quote Result:", quoteResult);

  
  const sendTx = await walletClient.writeContract({
    address: contractAddress,
    abi: curator.abi,
    functionName: 'send',
    args: [dstEid, message, options],
    value: quoteResult.nativeFee
  });

  console.log('Send Transaction:', sendTx);
}

main();
