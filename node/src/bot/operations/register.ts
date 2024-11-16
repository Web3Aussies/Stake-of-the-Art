import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import Command from "../command";
import HandlerContext from "../context";
import { collections } from "../../services/database.services";
import { ObjectId } from "mongodb";

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;
    
    // Check if user has already registered
    if (context) {
        await conversation.send("You have already registered.");
        return;
    }

    // Create viem custodial wallet and add to MongoDB
    const address = message.senderAddress;

    var pk = generatePrivateKey();
    var account = privateKeyToAccount(pk);

    await collections.users?.insertOne({
        _id: new ObjectId(),
        identityId: address,
        privateKey: pk,
        address: account.address
    });

    await conversation.send("Welcome on board! You are now registered.");
}

const RegisterBot = new Command("register", handle);

export default RegisterBot;