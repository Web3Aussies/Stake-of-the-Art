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
import ListBot from "./operations/list";
import { ReplyCodec } from "@xmtp/content-type-reply";
import DownloadBot from "./operations/download";
import { Login } from "../services/stakeoftheart";
import { RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";

dotenv.config();

export type BotHandler = (ctx: HandlerContext) => Promise<void>;

export default async function () {
    // Setup XMTP client
    const provider = new JsonRpcProvider(process.env.POLYGON_AMOY_URL!);
    const signer = new Wallet(`0x${process.env.XMTP_KEY!}`, provider);
    const client = await Client.create(signer, { env: "production" });
    client.registerCodec(new ReplyCodec());
    client.registerCodec(new RemoteAttachmentCodec());

    const logger =  createLogger(true, "info", "bot", {
        walletAddress: client.address
    });

    // Create array of commands that the bot can handle
    const replyBots: Command[] = [DownloadBot];
    const bots: Command[] = [InfoBot, BalanceBot, CategoriesBot, RegisterBot, DepositBot, SampleBot, ListBot, DownloadBot];


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
        const context = await Login(
            await collections.users?.findOne({
                identityId: message.senderAddress
            })
        );
        
        for (const bot of bots) {
            console.log(message, context);

            if (replyBots.includes(bot)) {
                processed = await bot.processReplies(message, context);
            } else {
                processed = await bot.processMessages(message, context);
            }
            

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