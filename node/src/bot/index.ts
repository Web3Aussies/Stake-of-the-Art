import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { JsonRpcProvider, Wallet } from "ethers";
import HandlerContext from "./context";
import { createLogger } from "./logger";
import Command from "./command";

dotenv.config();

export type BotHandler = (ctx: HandlerContext) => Promise<void>;

export default async function () {
    // Setup XMTP client
    const provider = new JsonRpcProvider(process.env.POLYGON_AMOY_URL!);
    const signer = new Wallet(`0x${process.env.XMTP_KEY!}`, provider);
    const client = await Client.create(signer, { env: "production" });

    const logger =  createLogger(true, "info", "bot", {
        walletAddress: client.address
    });

    // Create array of commands that the bot can handle
    const bots: Command[] = [];


    // Stream all messages to test if setup works
    for await (const message of await client.conversations.streamAllMessages()) {
        logger.info({messageId: message.id }, "Recieved message");
        
        console.log(`Message id: ${message.id}`);

        let processed = false;

        // need to check if sender address is our own address and ignore
        if (message.senderAddress === client.address) {
            continue;
        }

        // Do simple reply for now
        const conversation = message.conversation;

        await conversation.send("Hello world");
    }
}