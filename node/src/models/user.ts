import { ObjectId, BSON, WithId } from "mongodb";
import { Address, Hex } from "viem";

export type User = {
    identityId: string;
    privateKey: Hex;
    address: Hex;
    token?: string;
    expiresAt?: number;
};