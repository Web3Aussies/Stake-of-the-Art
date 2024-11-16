import { CreateImageAttachment } from "../../services/operations/createImageAttachment";
import Command from "../command";
import HandlerContext from "../context";
import dotenv from "dotenv";

dotenv.config();

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Fetch the sample image
    await conversation.send(`This a sample of our art:`);
    
    let attachmentMessage = await CreateImageAttachment(process.env.SAMPLE_URL!, context!);

    await conversation.send(attachmentMessage?.attachment, {
        contentType: attachmentMessage?.contentType
    });
}

const SampleBot = new Command("sample", handle);

export default SampleBot;