import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { JsonRpcProvider, Wallet } from "ethers";
import HandlerContext from "./context";
import { createLogger } from "./logger";
import Command from "./command";
import InfoBot from "./operations/info";
import { collections } from "../services/database.services";
import { User } from "../models/user";
import BalanceBot from "./operations/balance";
import CategoriesBot from "./operations/categories";
import RegisterBot from "./operations/register";
import DepositBot from "./operations/deposit";
import SampleBot from "./operations/sample";

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
    const bots: Command[] = [InfoBot, BalanceBot, CategoriesBot, RegisterBot, DepositBot, SampleBot];


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

        // Test with dummy context
        /*
        await collections.users?.insertOne({
            identityId: "test",
            privateKey: "0xasdadsa",
            address: "0x5a1F594CA236A8938CADAd6616AAb9A164A1fDFD",
        });
        */

        console.log(`0x${message.senderAddress.replace("0x", "")}`);

        const context = await collections.users?.findOne<User>({
            identityId: `0x${message.senderAddress.replace("0x", "")}`,
        });
        
        for (const bot of bots) {
            console.log(message, context);
            processed = await bot.processMessages(message, context);

            if (processed) {
                break;
            }
        }

        if (!processed) {
            processed = await InfoBot.processMessages(message, context, true);
        }
    }

    return {
        bots
    };
}