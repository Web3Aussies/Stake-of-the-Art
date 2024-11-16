import Command from "../command";
import HandlerContext from "../context";
import dotenv from "dotenv";

dotenv.config();

export type Wallpaper = {
    title?: string,
    imageUrl: string,
}

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (!context) {
        await conversation.send("Please register before trying to search for wallpapers.");
        return;
    }
    
    // Fetch wallpapers
    // const wallpapers = await fetch()

    const wallpapers: Array<Wallpaper> = [
        {
            title: "Cool thing 1",
            imageUrl: `${process.env.SAMPLE_URL}`
        },
        {
            imageUrl: `${process.env.SAMPLE_URL}`
        },
        {
            title: "Cool thing 3",
            imageUrl: `${process.env.SAMPLE_URL}`
        },
    ];

    // Loop over wallpapers to display them one by one
    for (var i = 0; i < wallpapers.length; i++) {
        await conversation.send(`Wallpaper ${i+1}:${wallpapers[i].title ? " " + wallpapers[i].title : ""}`);
        await conversation.send(`${wallpapers[i].imageUrl}`);
    }
}

const ListBot = new Command("list", handle);

export default ListBot;