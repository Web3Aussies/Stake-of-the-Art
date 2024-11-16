import Command from "../command";
import HandlerContext from "../context";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Check if no context
    if (!context) {
        console.log("Issue getting user context.");
        return;
    }

    if (context) {
        await conversation.send("Hi welcome to Stake of the art.");
    }

    return;
}

const InfoBot = new Command("info", handle);

export default InfoBot;