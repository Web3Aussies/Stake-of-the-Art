import { Request, Response } from "express";
import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";

export type StoreResponse = {
    cid: string,
    dealUUID: string,
    storageProvider: string
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


        // Get car file details for deal
        


        // Send deal on to storage provider
        /*await ssh.execCommand("export FULLNODE_API_INFO=https://api.calibration.node.glif.io", { cwd: "/var/www" }).then(result => {

        }); */

        // Delete files


        // boost deal-status --provider=t017840 --deal-uuid=

        //
    })
}