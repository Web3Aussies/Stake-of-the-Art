import { WithId } from "mongodb";
import { User } from "../../models/user";
import { v4 as uuidv4 } from "uuid";
import { AttachmentCodec, RemoteAttachmentCodec } from "@xmtp/content-type-remote-attachment";

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
}