import dotenv from "dotenv";
import { PinResponse } from "pinata-web3";
import { createWalletClient, encodeFunctionData, http, parseAbi, SendTransactionParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygonAmoy } from "viem/chains";

dotenv.config();

export default async function MintToken(metadata: PinResponse, creatorAddress: `0x${string}`) {
    const contractAbi = parseAbi([
        // Replace with the actual ABI of the safeMint function
        "function safeMint(address to, string memory uri)"
    ]);

    try {
        // Define the transaction data
        const transactionData = {
            to: process.env.NFT_CONTRACT_ADDRESS!,
            data: encodeFunctionData({
                abi: contractAbi,
                functionName: "safeMint",
                args: [creatorAddress,
                    metadata.IpfsHash],
            }),
        };

        const privateKey = process.env.WALLET_PRIVATE_KEY;

        const walletClient = createWalletClient({
            account: privateKeyToAccount(`0x${privateKey}`),
            chain: polygonAmoy,
            transport: http(`${process.env.POLYGON_AMOY_RPC}/${process.env.INFURA_PROJECT_ID}`),
        });

        // Send the transaction
        const transactionHash = await walletClient.sendTransaction(transactionData as SendTransactionParameters);
        console.log(`Transaction sent! Hash: ${transactionHash}`);

        // Wait for the transaction to be minted
        // Don't know why this call does not finish
        // const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash });
        // console.log("Transaction confirmed:", stringify(receipt));
    } catch (error) {
        console.error("Error while minting token:", error);
    }
}