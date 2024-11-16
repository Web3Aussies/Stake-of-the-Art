import pino from "pino";
import { BotHandler } from ".";
import { DecodedMessage } from "@xmtp/xmtp-js";
import { WithId } from "mongodb";
import { User } from "../models/user";
import HandlerContext from "./context";
import { createLogger } from "./logger";
import { sleep } from "./utils";
import { ContentTypeReply, Reply } from "@xmtp/content-type-reply";

export default class Command {
    name: string;
    handler: BotHandler;
    running: boolean = false;
    logger: pino.Logger;

    constructor (name: string, handler: BotHandler) {
        this.name = name;
        this.handler = handler;
        this.logger = createLogger(true, "info", name, {
            name: name
        });
    }

    async processReplies(
        message: DecodedMessage,
        context?: WithId<User> | null,
        override?:boolean
    ): Promise<boolean> {
        // Check if message is a reply
        if (!message.contentType.sameAs(ContentTypeReply)) {
            this.logger.warn(
                { messageId: message.id },
                "Message is not a reply. Expected a reply for this command."
            );
            return false;
        }

        const reply: Reply = message.content;

        if (!reply?.content || typeof reply.content !== "string") {
            this.logger.warn(
                { messageId: message.id },
                "Reply has no content or is not a string"
            );
            return false;
        }

        if (
            !reply.content.toLowerCase().startsWith(this.name.toLowerCase()) &&
            !override
          ) {
            return false;
          }
      
          this.logger.info(
            { messageId: message.id },
            `Reply received: ${this.name}`
          );
          try {
            await this.handler(new HandlerContext(message, context));
          } catch (e) {
            this.logger.error({ error: e }, "Error processing message");
          }
      
          return true;
    }

    async processMessages(
        message: DecodedMessage,
        context?: WithId<User> | null,
        override?:boolean
    ): Promise<boolean> {
        // Check if message is valid
        if (!message?.content || typeof message.content !== "string") {
            
            this.logger.warn(
                { messageId: message.id },
                "Message is not valid."
            );

            return false;
        }

        // Check override
        if (!message.content.toLowerCase().startsWith(this.name.toLowerCase()) &&
            !override
        ) {
            return false;
        }

        // Log that we have recieved a message
        this.logger.info(
            { messageId: message.id },
            `Message recieved: ${this.name}`
        );

        try {
            await this.handler(new HandlerContext(message, context));
        } catch (err: any) {
            this.logger.error({ error: err }, "Error processing message.");
        }

        return true;
    }

    private async retryProcessingLoop() {
        while (this.running) {
            try {
                const numProcessed = 0;
                
                this.logger.debug({ numProcessed }, "completed retry loop");
            } catch (err: any) {
                this.logger.error({ error: err }, "error processing messages");
            }

            // Sleep for 10 secs before retrying
            await sleep( 1000 * 10 );
        }
    }
}