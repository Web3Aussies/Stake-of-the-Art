const {
  createPublicClient,
  createWalletClient,
  http,
  polygonAmoy,
  sepolia,
} = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { parseEther, encodeAbiParameters } = require("viem/utils");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { Options } = require("@layerzerolabs/lz-v2-utilities");

// Load environment variables
dotenv.config();

const rpcUrl = process.env.RPC_URL || "";

const dstEid = 40161; // Sepolia
const curatorAddress = "0xE631e5ed117B634954f2f5FDeEF95849B9f2DbC8"; // Replace with your contract address
const collectionAddress = "0x997F2b992100B914658822118Be4d4BB9705D6d0"; // Replace with your contract address
const collection = JSON.parse(fs.readFileSync("./Collection.json", "utf-8"));
const curator = JSON.parse(fs.readFileSync("./Curator.json", "utf-8"));
const privateKey = process.env.PRIVATE_KEY || "";
const account = privateKeyToAccount(privateKey);
// const galleryAddress = "0xE3eE56B8102457D43beb87fbcC54eeE732E5a3Fc"; // Replace with your contract address

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

  console.log("Owner:", version);

  // Define the parameters for the didReceiveAttestation function
  const attester = walletClient.account.address; // Replace with the actual attester address
  const schemaId = 1; // Replace with the actual schema ID
  const attestationId = 1; // Replace with the actual attestation ID

  // Call the didReceiveAttestation function
  const sendTx = await walletClient.writeContract({
    address: curatorAddress,
    abi: curator.abi,
    functionName: "didReceiveAttestation",
    args: [attester, schemaId, attestationId, "0x"],
    value: parseEther("0.01"), // Replace with the actual value if needed
  });

  console.log("Send Transaction:", sendTx);

  // Print wallet address
  console.log(walletClient.account.address);
}

main();
