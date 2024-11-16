import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { JsonRpcProvider, Wallet } from "ethers";
import HandlerContext from "./context";

dotenv.config();

export type BotHandler = (ctx: HandlerContext) => Promise<void>;

export default async function () {
    // Setup XMTP client
    const provider = new JsonRpcProvider(process.env.POLYGON_AMOY_URL!);
    const signer = new Wallet(`0x${process.env.XMTP_KEY!}`, provider);
    const client = await Client.create(signer, { env: "production" });

    // Stream all messages to test if setup works
    for await (const message of await client.conversations.streamAllMessages()) {
        console.log("Message recieved");
    }
}