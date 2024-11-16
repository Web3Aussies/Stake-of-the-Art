import { WithId } from "mongodb";
import { User } from "../../models/user";
import { v4 as uuidv4 } from "uuid";
import { AttachmentCodec, RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import dotenv from "dotenv";

dotenv.config();

export type CreateShareResponse = {
    shareId: string,
    uploadUrl: string
}

export async function CreateImageAttachment(imageUrl: string, context: WithId<User>) {
    // Download file from hot storage
    const res = await fetch(imageUrl);

    if (res.status != 200) {
        console.error(`Failed to get '${imageUrl}' (${res.status})`);
        return;
    }

    const img = await res.blob();
    let imgArray = new Uint8Array(await img.arrayBuffer());

    // Genereate uuid for filename
    const uuid = uuidv4();

    console.log(uuid);

    const attachment = {
        filename: uuid + ".jpg",
        mimeType: "image/jpeg",
        data: imgArray
    };

    const encyrptedEncoded = await RemoteAttachmentCodec.encodeEncrypted(
        attachment,
        new AttachmentCodec()
    );

    console.log(encyrptedEncoded);

    // Create share to get upload url

    const createRes = await fetch(`${process.env.DOTNET_ENDPOINT_URL}/app/shares`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${context.token}`
        },
        body: JSON.stringify({
            filename: attachment.filename,
            contentType: "application/octet-stream"
        }),
    });

    const createShare: CreateShareResponse = await createRes.json();

    console.log("Create share response: ", createShare);
}