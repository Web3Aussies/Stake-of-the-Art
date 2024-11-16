using Amazon.Lambda.S3Events;
using MassTransit;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Consumers.Storage;

public class FileAddedConsumerDefinition : ConsumerDefinition<FileAddedConsumer>
{
    protected override void ConfigureConsumer(IReceiveEndpointConfigurator endpointConfigurator,
        IConsumerConfigurator<FileAddedConsumer> consumerConfigurator,
        IRegistrationContext context)
    {
        endpointConfigurator.ConfigureConsumeTopology = false;
        endpointConfigurator.ClearSerialization();
        endpointConfigurator.UseNewtonsoftRawJsonSerializer();
    }
}

public class FileAddedConsumer : IConsumer<S3Event>
{
    readonly IRepository _repository;

    public FileAddedConsumer(IRepository repository)
    {
        _repository = repository;
    }


    public async Task Consume(ConsumeContext<S3Event> context)
    {
        var message = context.Message;

        if (message is null || message.Records is null)
            return;

        foreach (var record in message.Records)
        {
            await ProcessAsset(record);
            await ProcessShare(record);
        }

    }

    async Task ProcessAsset(S3Event.S3EventNotificationRecord record)
    {
        var fileKey = record.S3.Object.Key;
        var keyParts = fileKey.Split('/');
        var userId = keyParts.First();
        var assetId = keyParts.Last().Split('.').First();

        var asset = await _repository.Assets.Find(x => x.Id, assetId);

        if (asset is null) return;

        asset.Status = FileStatus.Sign;
        asset.FileSizeBytes = record.S3.Object.Size;
        asset.BucketName = record.S3.Bucket.Name;
        asset.ObjectKey = fileKey;

        if (!string.IsNullOrWhiteSpace(record.RequestParameters?.SourceIPAddress))
            asset.Meta.Add(nameof(record.RequestParameters.SourceIPAddress), record.RequestParameters.SourceIPAddress);

        asset.UpdatedOn = DateTimeOffset.UtcNow;

        await _repository.Assets.Update(x => x.Id == assetId, asset);
    }
    async Task ProcessShare(S3Event.S3EventNotificationRecord record)
    {
        var fileKey = record.S3.Object.Key;
        var keyParts = fileKey.Split('/');
        var userId = keyParts.First();
        var shareId = keyParts.Last().Split('.').First();

        var share = await _repository.Shares.Find(x => x.Id, shareId);
        if (share is null) return;

        share.Status = FileStatus.Sign;
        share.FileSizeBytes = record.S3.Object.Size;
        share.BucketName = record.S3.Bucket.Name;
        share.ObjectKey = fileKey;

        if (!string.IsNullOrWhiteSpace(record.RequestParameters?.SourceIPAddress))
            share.Meta.Add(nameof(record.RequestParameters.SourceIPAddress), record.RequestParameters.SourceIPAddress);

        share.UpdatedOn = DateTimeOffset.UtcNow;

        await _repository.Shares.Update(x => x.Id == shareId, share);
    }

}
