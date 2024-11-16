import { Request, Response } from "express";
import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";
import getCurrentEpoch from "../utils/getCurrentEpoch";

export type StoreResponse = {
    cid: string,
    dealUUID: string,
    storageProvider: string,
    dealStatus: string
}

export const StoreHandler = async (req: Request, res: Response) => {
    // Check if the request is valid
    const { cid } = req.params;

    console.log(cid);

    const ssh = new NodeSSH();

    // connect to our ec2 instance
    ssh.connect({
        host: process.env.FILECOIN_AWS_URL,
        username: process.env.FILECOIN_AWS_USERNAME,
        privateKeyPath: process.env.FILECOIN_AWS_KEY_LOCATION
    })
    .then(async () => {
        // Download image from IPFS pinata
        await ssh.execCommand('echo "hello world"').then((result: any) => {
            console.log(result);
        });

        // Create car file of image
        // Option 1: IPFS download using car format
        await ssh.execCommand(`wget -O ${cid}.car ipfs.io/ipfs/${cid}?format=car`).then((result: any) => {
            console.log(result);
        });
        
        // Option 2: use go-car

        // Upload to pinata
        let carCid = "";

        await ssh.execCommand(`curl --request POST \
        --url https://api.pinata.cloud/pinning/pinFileToIPFS \
        --header 'Authorization: Bearer ${process.env.PINATA_JWT}' \
        --header 'Content-Type: multipart/form-data' \
        --form file=@${cid}.car \
        --form 'pinataMetadata={
        "name": "${cid}.car"
        }' \
        --form 'pinataOptions={
        "cidVersion": 1
        }'`).then((result) => {
            console.log(result);

            const resultJson = JSON.parse(result.stdout);

            carCid = resultJson.IpfsHash;
            console.log(carCid);
        });

        let commpCid = "";
        let carSize = "";
        let pieceSize = "";

        // Get car file details for deal
        await ssh.execCommand(`boostx commp ./${cid}.car`).then((result: any) => {
            console.log(result);

            let stringSplit = result.stdout.split("\n");

            commpCid = stringSplit[0].split("  ")[1];
            pieceSize = stringSplit[1].split("  ")[1];
            carSize = stringSplit[2].split("  ")[1];

            console.log(commpCid, pieceSize, carSize);
        });

        const rpcUrl = process.env.FILECOIN_RPC_URL;

        // Calculate epoch time
        const currentEpoch = getCurrentEpoch();
        
        console.log("Current Epoch:", currentEpoch);

        let dealUuid = "";

        // Send deal on to storage provider
        await ssh.execCommand(`export FULLNODE_API_INFO=${rpcUrl} && boost -vv deal --verified=false \
            --start-epoch=${currentEpoch + 2880} \
            --duration=${process.env.FILECOIN_STORAGE_DURATION} \
            --storage-price=${process.env.FILECOIN_STORAGE_PRICE} \
            --provider=${process.env.FILECOIN_STORAGE_PROVIDER} \
            --http-url=https://${process.env.GATEWAY_URL}/${carCid} \
            --commp=${commpCid} \
            --car-size=${carSize} \
            --piece-size=${pieceSize} \
            --payload-cid=${cid}`).then((result: any) => {
            console.log(result);
            
            let stringSplit = result.stdout.split("\n");

            console.log(stringSplit);

            dealUuid = stringSplit[1].trim().split(" ")[2];

            console.log(dealUuid);
        });

        let storeResponse: StoreResponse = {
            dealStatus: "",
            dealUUID: dealUuid,
            storageProvider: process.env.FILECOIN_STORAGE_PROVIDER!,
            cid: cid
        }

        // Get deal-status
        await ssh.execCommand(`export FULLNODE_API_INFO=${rpcUrl} && boost deal-status \
        --provider=${process.env.FILECOIN_STORAGE_PROVIDER} \
        --deal-uuid=${dealUuid}`).then((result) => {
            console.log(result);

            let stringSplit = result.stdout.split("\n");

            storeResponse.dealStatus = stringSplit[2].split("deal status: ")[1];

            console.log(storeResponse.dealStatus);
        });

        return storeResponse;
    })
}