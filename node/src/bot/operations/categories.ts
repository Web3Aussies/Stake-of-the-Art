import Command from "../command";
import HandlerContext from "../context";

export type GetCategories = {
    categories: {
        name: string
    }[],
}

async function handle({ message, context }: HandlerContext) {
    const conversation = message.conversation;

    if (!context) {
        await conversation.send("You are not registered. Please register before accessing our wallpaper categories");
    }

    // API endpoint to get catgories
    // const response = await fetch(`${asset_endpoint}`)

    const categories: GetCategories = {
        categories: [
            {
                name: "Fantasy"
            },
            {
                name: "Digital Art"
            }
        ]
    };

    await conversation.send("Categories:");

    for (var i = 0; i < categories.categories.length; i++) {
        await conversation.send(`${i+1}. ${categories.categories[i].name}`);
    }
}

const CategoriesBot = new Command("categories", handle);

export default CategoriesBot;