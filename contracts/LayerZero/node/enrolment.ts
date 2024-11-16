const {
  createPublicClient,
  createWalletClient,
  http,
  polygonAmoy,
  sepolia,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { Options } = require("@layerzerolabs/lz-v2-utilities");

// Load environment variables
dotenv.config();

const rpcUrl = process.env.RPC_URL || "";
const collectionAddress = "0x62976758Fa9f84309748f0650b60fbF2741Eda81"; // Replace with your contract address
const collection = JSON.parse(fs.readFileSync("./Collection.json", "utf-8"));
const privateKey = process.env.PRIVATE_KEY || "";
const account = privateKeyToAccount(privateKey);
const galleryAddress = "0xd61Dd9BBEeC4043a9b3eE41F8Ab57580cfCf928E"; // Replace with your contract address

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
    address: curatorAddress,
    abi: curator.abi,
    functionName: "owner",
  });

  console.log("App Version:", version);

  // Get quote
  const dstEid = 40161; // Sepolia
  const peers = await publicClient.readContract({
    address: curatorAddress,
    abi: curator.abi,
    functionName: "peers",
    args: [dstEid],
  });

  console.log("Peers", peers);

  //   console.log('Quote Result:', quoteResult);
  // } catch (error) {
  //   console.error('Error calling contract:', error);
  // }

  // const message = "Hello, LayerZero!";
  // const options = Options.newOptions()
  //   .addExecutorLzReceiveOption(200000, 0)
  //   .toHex()
  //   .toString();

  // const payInLzToken = false;
  // const quoteResult = await publicClient.readContract({
  //   address: curatorAddress,
  //   abi: curator.abi, // Use ABI from the Foundry JSON file
  //   functionName: "quote",
  //   args: [dstEid, message, options, payInLzToken],
  // });

  // console.log("Quote Result:", quoteResult);

  const sendTx = await walletClient.writeContract({
    address: curatorAddress,
    abi: curator.abi,
    functionName: "notifyEnrollment",
    args: [dstEid, message, options],
    value: quoteResult.nativeFee,
  });

  console.log("Send Transaction:", sendTx);

  // Print wallet address
  console.log(walletClient.account.address);
  

  // Try create a collection
  walletClient.writeContract({
    address: curatorAddress,
    abi: curator.abi,
    functionName: "createCollection",
    args: ["0x9e1F2c3432ddCe2AAe0f605f38e3234EE6fbC91a"],    
  });

}

main();