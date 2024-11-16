import Command from "../command";
import HandlerContext from "../context";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (!context) {
        await conversation.send("Please register before trying to deposit into your account.");
        return;
    }

    // Send them their custodial wallet address to top
    const custodialAddress = context.address;

    await conversation.send(`Deposit funds into your unique address: ${custodialAddress}`);
}

const DepositBot = new Command("deposit", handle);

export default DepositBot;