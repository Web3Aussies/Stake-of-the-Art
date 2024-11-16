import { Request, Response } from "express";
import { PinataSDK, PinResponse } from "pinata-web3";
import dotenv from "dotenv";
import MintToken from "../utils/mintToken";

dotenv.config();

export type MintRequest = {
    title?: string,
    description?: string,
    imageCid: string,
    creatorAddress: `0x${string}`
}

export type NFTMetadata = {
    name: string,
    description: string,
    image: string
}

export type MetadataUpload = {
    ipfsHash: string
}

export type MintResponse = {
    status: string
}

export default async function MintHandler( req: Request, res: Response ) {
    const request: MintRequest = req.body;

    const pinata = new PinataSDK({
        pinataJwt: process.env.PINATA_JWT,
        pinataGateway: process.env.GATEWAY_URL
    })

    // Create metadata file
    const metadata: NFTMetadata = {
        name: `${request.title}`,
        description: `${request.description}`,
        image: `${process.env.GATEWAY_URL}/ipfs/${request.imageCid}`
    }

    // Attach metadata to pinata file
    const metaBlob = new Blob([JSON.stringify(metadata)]);
    const metaFile = new File([metaBlob], `${request.imageCid}.json`, { type: "text/json" })
    const metaUpload: PinResponse = await pinata.upload.file(metaFile);

    console.log(metaUpload);

    await MintToken(metaUpload, request.creatorAddress);

    const success: MintResponse = {
        status: "200"
    }

    return success;
}