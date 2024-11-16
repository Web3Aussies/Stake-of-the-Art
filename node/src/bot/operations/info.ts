import Command from "../command";
import HandlerContext from "../context";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (context) {
        await conversation.send(`Welcome back to Stake of the Art.
- type 'balance' to check your balance
- type 'deposit' to deposit funds
- type 'list # [categories]' to see the top # wallpapers in different categories
- type 'categories' to see wallpaper categories
- reply 'download' to a wallpaper to download`);
        return;
    }

    await conversation.send(
        `Welcome to Stake of the Art.
        - type 'register' to open an account
        - type 'sample' to see a sample of the art collection`
    );

    return;
}

const InfoBot = new Command("info", handle);

export default InfoBot;