import { WithId } from "mongodb";
import { User } from "../models/user";
import { privateKeyToAccount } from "viem/accounts";
import { collections } from "./database.services";

type Nonce = {
    nonce: string;
};

type LoginResponse = {
    token: string;
    expiresIn: number;
}

export async function Login(context?: WithId<User> | null) {
    if (!context) return context;
    if (context.token && context.expiresAt && context.expiresAt > Date.now()) {
        return context;
    }

    const nReq = await fetch(`${process.env.DOTNET_ENDPOINT_URL}/app/accounts/nonce`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });

    const nData: Nonce = await nReq.json();
    const wallet = privateKeyToAccount(context.privateKey);
    const signature = await wallet.signMessage({ message: nData.nonce });
    const lReq = await fetch(`${process.env.DOTNET_ENDPOINT_URL}/app/accounts/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nuance: nData.nonce,
            signature,
            address: wallet.address
        })
    });

    const lData: LoginResponse = await lReq.json();
    context.token = lData.token;
    context.expiresAt = Date.now() + (lData.expiresIn - 60) * 1000;

    await collections.users?.updateOne(
        { _id: context._id },
        {
            $set: {
                token: context.token,
                expiresAt: context.expiresAt
            }
        }
    );

    return context;
}