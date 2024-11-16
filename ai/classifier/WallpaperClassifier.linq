<Query Kind="Program">
  <NuGetReference>CsvHelper</NuGetReference>
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <NuGetReference>OpenAI</NuGetReference>
  <Namespace>CsvHelper</Namespace>
  <Namespace>CsvHelper.Configuration</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>System.Globalization</Namespace>
</Query>

using OpenAI.Chat;

void Main()
{
	MyExtensions.SetEnvironmentVariables();
	
	ClassifyImage(@"C:\Users\chris\Core\EthGlobal\Stake-of-the-Art\ai\wallpaper\images\Good\abstract.jpg", @"C:\Users\chris\Core\EthGlobal\Stake-of-the-Art\ai\classifier\prompt.txt");
}

// You can define other methods, fields, classes and namespaces here

string ClassifyImage(string imageFilePath, string promptFilePath)
{
	ChatClient client = new(model: "gpt-4o-mini", apiKey: Environment.GetEnvironmentVariable("OPENAI_API_GLOBAL_ETH_KEY"));

	using Stream imageStream = File.OpenRead(imageFilePath);
	BinaryData imageBytes = BinaryData.FromStream(imageStream);

	// Get the prompt
	string category_prompt = File.ReadAllText(promptFilePath);

	List<ChatMessage> messages =
	[
		new UserChatMessage(
			ChatMessageContentPart.CreateTextPart(category_prompt),
			ChatMessageContentPart.CreateImagePart(imageBytes, "image/jpg")),
	];

	ChatCompletionOptions options = new()
	{
		ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
			jsonSchemaFormatName: "image_classification",
			jsonSchema: BinaryData.FromBytes("""
	            {
	                "type": "object",
	                "properties": {
	                    "description": { "type": "string" },
	                    "categories": {
	                        "type": "array",
	                        "items": {
	                            "type": "object",
	                            "properties": {
	                                "name": { "type": "string" },
	                                "score": { "type": "integer" }
	                            },
	                            "required": ["name", "score"],
	                            "additionalProperties": false
	                        }
	                    },
	                    "color": {
	                        "type": "object",
	                        "properties": {
	                            "name": { "type": "string" },
	                            "score": { "type": "integer" }
	                        },
	                        "required": ["name", "score"],
	                        "additionalProperties": false
	                    }
	                },
	                "required": ["description", "categories", "color"],
	                "additionalProperties": false
	            }
	            """u8.ToArray()),
			jsonSchemaIsStrict: true),
		Temperature = 0
	};

	ChatCompletion completion = client.CompleteChat(messages, options);

	Console.WriteLine($"[ASSISTANT]: {completion.Content[0].Text}");

	return completion.Content[0].Text;
}
