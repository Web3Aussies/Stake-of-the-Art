import { WithId } from "mongodb";
import { User } from "../../models/user";
import { v4 as uuidv4 } from "uuid";
import { AttachmentCodec, ContentTypeRemoteAttachment, RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";
import dotenv from "dotenv";

dotenv.config();

export type CreateShareResponse = {
    shareId: string,
    uploadUrl: string
}

export type GetShareResponse = {
    shareId?: string,
    status: string,
    url?: string
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
            fileName: attachment.filename,
            contentType: "application/octet-stream"
        }),
    });

    const createShare: CreateShareResponse = await createRes.json();

    console.log("Create share response: ", createShare);

    // Upload encrypted payload to S3 using upload url from create share
    const uploadUrl = createShare.uploadUrl;

    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: encyrptedEncoded.payload,
        headers: {
            "Content-Type": "application/octet-stream"
        }
    });

    if (uploadRes.status !== 200) {
        console.error(`Failed to upload '${uploadUrl} (${uploadRes.status})`);
        return;
    }

    // Get share url to create remote attachment message
    let getShare: GetShareResponse = {
        status: "Pending"
    };

    while (getShare.status == "Pending") {
        let getShareRes = await fetch(`${process.env.DOTNET_ENDPOINT_URL}/app/shares/${createShare.shareId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${context.token}`
            }
        });

        getShare = await getShareRes.json();
        console.log("Get Share Response:", getShare);
    }

    const remoteAttachment = {
        url: getShare.url,
        contentDigest: encyrptedEncoded.digest,
        salt: encyrptedEncoded.salt,
        nonce: encyrptedEncoded.nonce,
        secret: encyrptedEncoded.secret,
        scheme: "https://",
        filename: attachment.filename,
        contentLength: attachment.data.byteLength,
        contentFallback: imageUrl
    };

    return {
        attachment: remoteAttachment,
        contentType: ContentTypeRemoteAttachment
    }
}