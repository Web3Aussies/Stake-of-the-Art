import { ContentTypeReply, Reply } from "@xmtp/content-type-reply";
import Command from "../command";
import HandlerContext from "../context";
import { DecodedMessage } from "@xmtp/xmtp-js";
import { ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Check if message isn't a reply
    if (!message.contentType.sameAs(ContentTypeReply)) {
        await conversation.send("Reply to a wallpaper attachment message sent from the list command.");
        return;
    }

    const reply: Reply = message.content;

    // Get original message
    const messageId = reply.reference;

    const expiryDate= new Date();
    expiryDate.setHours(expiryDate.getHours() - 1);

    const messages:Array<DecodedMessage> = await conversation.messages({
        startTime: expiryDate,
    });

    const originalMessage = messages.find((m) => m.id == messageId);

    // Check if list has expired
    if (originalMessage == undefined) {
        await conversation.send("Wallpaper download has expired. Please request new wallpapers then download.");
        return;
    }

    console.log("Original Message: ", originalMessage);

    // Check if original message is content type remote attachment
    if (!originalMessage.contentType.sameAs(ContentTypeRemoteAttachment)) {
        await conversation.send("Replied to message isn't a wallpaper. Please reply to a wallpaper attachment requested through the list command.");
        return;
    }

    // Get download link from backend using original message
    
    // Send download message
    await conversation.send(`Download:\n${originalMessage.content.url}`);
    
}

const DownloadBot = new Command("download", handle);

export default DownloadBot;