import Command from "../command";
import HandlerContext from "../context";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (context) {
        await conversation.send("Welcome back");
        return;
    }

    await conversation.send(
        `Welcome to Stake of the Art`
    );

    return;
}

const InfoBot = new Command("info", handle);

export default InfoBot;