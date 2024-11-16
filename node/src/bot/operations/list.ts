import Command from "../command";
import HandlerContext from "../context";
import dotenv from "dotenv";

dotenv.config();

export type WallpaperRequest = {
    total?: number,
    categories?: Array<string>
}

export type WallpaperResponse = {
    id: string,
    title?: string,
    filename: string,
    imageUrl: string,
    category: string
}

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    // Check if user exists
    if (!context) {
        await conversation.send("Please register before trying to search for wallpapers.");
        return;
    }

    // Get parameters
    const parameters = message.content.split(" ");

    const wallpaperRequest: WallpaperRequest = {
        total: 1,
        categories: []
    }

    // Loop over paramaters to determine query for wallpapers
    for (var i = 1; i < parameters.length; i++) {
        let parameter = parameters[i];

        // Check if the integer is highest one we've seen
        if (Number.isInteger(parseInt(parameter))) {
            console.log("Total:", parameter);
            parseInt(parameter) > wallpaperRequest.total! ? wallpaperRequest.total = parseInt(parameter) : null;
        } else {
            wallpaperRequest.categories?.push(parameter);
            console.log('Category:', parameter);
        }
    }

    // Check if wallpapersRequested is valid
    if (Number.isNaN(wallpaperRequest.total)) {
        await conversation.send("Incorrect command format: Expected a number for the total wallpapers requested.");
        return;
    }
    
    // Fetch wallpapers
    const response = await fetch(wallpaperRequest.categories!.length != 0 ?
        `${process.env.DOTNET_ENDPOINT_URL}/app/assets/random?Categories=${wallpaperRequest.categories?.join(",")}&Limit=${wallpaperRequest.total}&Width=1290&Height=2796` :
        `${process.env.DOTNET_ENDPOINT_URL}/app/assets/random?Limit=${wallpaperRequest.total}&Width=1290&Height=2796`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${context.token}`
        }
    });

    const wallpapers: Array<WallpaperResponse> = await response.json();

    // Let the user know what they searched for
    await conversation.send(wallpaperRequest.categories!.length != 0 ?
        `You searched for ${wallpaperRequest.total} wallpaper${wallpaperRequest.total != 1 ?
        "s" : ""} in the categor${wallpaperRequest.categories!.length == 1 ?
        "y" : "ies"}: ${wallpaperRequest.categories?.join(",")}\nFound ${wallpapers.length} wallpaper${wallpapers.length != 1 ?
        "s" : "" } in these categories.` :
        `You searched for ${wallpaperRequest.total} wallpaper${wallpaperRequest.total != 1 ?
        "s" : "" } across all categories.\nFound ${wallpapers.length} wallpaper${wallpapers.length != 1 ?
        "s" : "" }.`
    );

    // Loop over wallpapers to display them one by one
    for (var i = 0; i < wallpapers.length; i++) {
        let url = wallpapers[i].imageUrl;

        if (url) {
            await conversation.send(`Wallpaper ${i+1}:${wallpapers[i].title ? " " + wallpapers[i].title : ""}`);
            await conversation.send(`${process.env.WALLPAPER_CDN}${wallpapers[i].imageUrl}`);
        }
    }
}

const ListBot = new Command("list", handle);

export default ListBot;