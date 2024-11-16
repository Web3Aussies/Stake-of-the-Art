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


const dstEid = 40161; // Sepolia
const collectionAddress = "0x3c8Ff373DC7b6A5f25cC8867B77CF4d651dF1106"; // Replace with your contract address
const collection = JSON.parse(fs.readFileSync("./Collection.json", "utf-8"));
const privateKey = process.env.PRIVATE_KEY || "";
const account = privateKeyToAccount(privateKey);
const galleryAddress = "0xE3eE56B8102457D43beb87fbcC54eeE732E5a3Fc"; // Replace with your contract address

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
    address: collectionAddress,
    abi: collection.abi,
    functionName: "owner",
  });

  console.log("App Version:", version);

  // Get quote
  
  const peers = await publicClient.readContract({
    address: collectionAddress,
    abi: collection.abi,
    functionName: "peers",
    args: [dstEid],
  });

  console.log("Peers", peers);



  const message = "Hello, LayerZero!";
  const options = Options.newOptions()
    .addExecutorLzReceiveOption(200000, 0)
    .toHex()
    .toString();

  const payInLzToken = false;
  const quoteResult = await publicClient.readContract({
    address: collectionAddress,
    abi: collection.abi, // Use ABI from the Foundry JSON file
    functionName: "quoteEnrolment",
    args: [2],
  });

  console.log("Quote Result:", quoteResult);

  const sendTx = await walletClient.writeContract({
    address: collectionAddress,
    abi: collection.abi,
    functionName: "notifyEnrollment",
    args: [2],
    value: quoteResult.nativeFee,
  });

  console.log("Send Transaction:", sendTx);

  // Print wallet address
  console.log(walletClient.account.address);

}

main();
