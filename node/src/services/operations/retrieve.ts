import { Request, Response } from "express";
import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";

export type RetrieveHandlerResponse = {
    cid: string,
    dealUUID: string,
    storageProvider: string,
    dealStatus: string
}

export const RetrieveHandler = async (req: Request, res: Response) => {
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
        await ssh.execCommand(`lassie fetch -o ~/retrieve/${cid}.car ${cid}`).then((result) => {
            console.log(result);
        });

        await ssh.execCommand(`car extract -f ~/retrieve/${cid}.car`).then((result) => {
            console.log(result);
        });

        return;
    });
}