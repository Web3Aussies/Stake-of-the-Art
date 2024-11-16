import Command from "../command";
import HandlerContext from "../context";
import dotenv from "dotenv";

dotenv.config();

export type CategoriesResponse = {
    results: [
        {
            name: string,
            type: number
        }
    ],
    totalRecords: number,
    page: number,
    limit: number
}

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (!context) {
        await conversation.send("You are not registered. Please register before accessing our wallpaper categories");
    }

    // API endpoint to get catgories
    const response = await fetch(`${process.env.DOTNET_ENDPOINT_URL}/app/categories?Page=1&Limit=8`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${context!.token}`
        }
    });

    const categories: CategoriesResponse = await response.json();

    await conversation.send("Categories:");

    for (var i = 0; i < categories.results.length; i++) {
        await conversation.send(`${i+1}. ${categories.results[i].name}`);
    }
}

const CategoriesBot = new Command("categories", handle);

export default CategoriesBot;