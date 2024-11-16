import Command from "../command";
import HandlerContext from "../context";
import dotenv from "dotenv";

dotenv.config();

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Check context
    if (!context) {
        await conversation.send("Please register with us before seeing our sample wallpaper.");
    }

    // Fetch the sample image
    await conversation.send(`This a sample of our art:\n${process.env.SAMPLE_URL}`);
}

const SampleBot = new Command("sample", handle);

export default SampleBot;