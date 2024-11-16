import pino from "pino";
import { BotHandler } from ".";
import { DecodedMessage } from "@xmtp/xmtp-js";
import { WithId } from "mongodb";
import { User } from "../models/user";
import HandlerContext from "./context";

export default class Command {
    name: string;
    handler: BotHandler;
    running: boolean = false;

    constructor (name: string, handler: BotHandler) {
        this.name = name;
        this.handler = handler;
    }

    async processMessages(
        message: DecodedMessage,
        context?: WithId<User> | null,
        override?:boolean
    ): Promise<boolean> {
        // Check if message is valid
        if (!message?.content || typeof message.content !== "string") {
            console.log(`Message ${message.id} isn't valid.`);
            return false;
        }

        // Check override
        if (!message.content.toLowerCase().startsWith(this.name.toLowerCase()) &&
            !override
        ) {
            return false;
        }

        try {
            await this.handler(new HandlerContext(message, context));
        } catch (err: any) {
            console.log("Error ", err);
        }

        return true;
    }

    private async retryProcessingLoop() {
        while (this.running) {
            try {
                const numProcessed = 0;
                console.log(`${numProcessed}`);
            } catch (err: any) {
                console.log(`Error processing messages: ${err}`);
            }

            // Sleep for 10 secs before retrying
            // Plan to add sleep here
        }
    }
}