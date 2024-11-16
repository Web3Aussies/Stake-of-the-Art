import { DecodedMessage, SendOptions } from "@xmtp/xmtp-js";
import { Json } from "./types";
import { WithId } from "mongodb";
import { User } from "../models/user";

type PreparedReply = {
    content: any;
    options?: SendOptions;
};

export default class HandlerContext {
    message: DecodedMessage;
    context?: WithId<User> | null;

    constructor (message: DecodedMessage, context?: WithId<User> | null) {
        this.message = message;
        this.context = context;
    }
}