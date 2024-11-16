import { createPublicClient, http } from "viem";
import Command from "../command";
import HandlerContext from "../context";
import { polygonAmoy } from "viem/chains"

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Check if no user has been passed to command
    if (!context) {
        await conversation.send("You are not registered. Please register before requesting balance.");
        return;
    }

    // Get balance from Polygon Amoy RPC
    const publicClient = createPublicClient({
        chain: polygonAmoy,
        transport: http()
    });

    const balance = await publicClient.getBalance({
        address: context.address
    });


    console.log(`Balance: ${balance}`)
    await conversation.send(`${balance}`);
}

const BalanceBot = new Command("balance", handle);

export default BalanceBot;