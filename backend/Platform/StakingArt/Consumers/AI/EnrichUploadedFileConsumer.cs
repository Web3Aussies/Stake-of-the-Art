using MassTransit;
using Newtonsoft.Json.Linq;
using OpenAI.Chat;
using StakingArt.Messages;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Consumers.AI;

public class EnrichUploadedFileConsumer : IConsumer<AssetSigned>
{
    readonly IRepository _repository;
    readonly ChatClient _client;
    readonly IStorageService _storageService;

    public EnrichUploadedFileConsumer(IRepository repository, ChatClient client, IStorageService storageService)
    {
        _repository = repository;
        _client = client;
        _storageService = storageService;
    }
    public async Task Consume(ConsumeContext<AssetSigned> context)
    {
        var message = context.Message;

        var asset = await _repository.Assets.Find(x => x.Id, message.AssetId, context.CancellationToken);
        if (asset is null)
            return;

        // download file from s3
        await using var fileStream = await _storageService.Download(asset.ObjectKey, context.CancellationToken);

        var fileBytes = await BinaryData.FromStreamAsync(fileStream);

        var promptFilePath = $"{AppContext.BaseDirectory}/Consumers/AI/prompt.txt";
        var category_prompt = await File.ReadAllTextAsync(promptFilePath);

        List<ChatMessage> messages =
        [
            new UserChatMessage(
                ChatMessageContentPart.CreateTextPart(category_prompt),
                ChatMessageContentPart.CreateImagePart(fileBytes, "image/jpg")),
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

        ChatCompletion completion = await _client.CompleteChatAsync(messages, options);

        var content = completion.Content.FirstOrDefault();
        if (content is null) return;

        var jResult = JObject.Parse(content.Text);

        var result = jResult.ToObject<ClassificationResponse>();


        var selectedCategories = result.Categories.Count == 1
            ? new List<AssetCategory> { result.Categories.First() }
            : result.Categories.Where(x => x.Score > 75).ToList();


        var updater = _repository.Assets.Updater;
        var update = updater.Combine(
            updater.Set(x => x.Description, result.Description),
            updater.Set(x => x.Categories, selectedCategories.ToArray()),
            updater.Set(x => x.Colour, result.Color),
            updater.Set(x => x.UpdatedOn, DateTimeOffset.UtcNow)
        );
        await _repository.Assets.Patch(x => x.Id == asset.Id, update);

        // assign the asset to the correct category

        var categories = result
            .Categories
            .Select(x => new Category() { Type = CategoryType.Category, Name = x.Name })
            .ToList();

        categories.Add(new Category() { Type = CategoryType.Color, Name = result.Color.Name });

        foreach (var category in categories)
        {
            var model = await _repository.Categories.Find(x => x.Name, category.Name, context.CancellationToken, true);

            if (model is null)
                model = await _repository.Categories.Create(new() { Name = category.Name, Type = category.Type });

            model.Assets ??= new List<string>();
            model.Assets.Add(asset.Id);

            await _repository.Categories.Patch(
                x => x.Id == model.Id,
                _repository.Categories.Updater.Set(x => x.Assets, model.Assets));
        }
    }

    class ClassificationResponse
    {
        public string Description { get; set; }
        public ICollection<AssetCategory> Categories { get; set; }
        public AssetColour Color { get; set; }

    }



}
