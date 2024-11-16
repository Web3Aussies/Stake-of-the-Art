import { Request, Response } from "express";
import { NodeSSH } from "node-ssh";
import dotenv from "dotenv"

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
        await ssh.execCommand('echo "hello world"', { cwd: "/var/www" }).then((result: any) => {
            console.log(result);
        });

        // Create car file of image

        // Upload to pinata

        // Get car file details for deal



        // Send deal on to storage provider
        /*await ssh.execCommand("export FULLNODE_API_INFO=https://api.calibration.node.glif.io", { cwd: "/var/www" }).then(result => {

        }); */

        // Delete files


        // boost deal-status --provider=t017840 --deal-uuid=

        //
    })
}