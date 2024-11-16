using MassTransit;
using PinataNET;
using StakingArt.Infrastructure.Pinata;
using StakingArt.Messages;
using StakingArt.Services;

namespace StakingArt.Consumers.Storage;

public class UploadToPinataConsumer : IConsumer<AssetSigned>
{
    readonly IRepository _repository;
    readonly PinataClient _pinataClient;

    readonly IStorageService _storageService;
    readonly PinataFileClient _fileClient;
    readonly ILogger<UploadToPinataConsumer> _logger;

    public UploadToPinataConsumer(
        IRepository repository,
        PinataClient pinataClient,
        IStorageService storageService,
        PinataFileClient fileClient,
        ILogger<UploadToPinataConsumer> logger)
    {
        _repository = repository;
        _pinataClient = pinataClient;
        _storageService = storageService;
        _fileClient = fileClient;
        _logger = logger;
    }
    public async Task Consume(ConsumeContext<AssetSigned> context)
    {
        var message = context.Message;

        var asset = await _repository.Assets.Find(x => x.Id, message.AssetId, context.CancellationToken);
        if (asset is null)
            return;

        // upload file to pinata
        await using var fileStream = await _storageService.Download(asset.ObjectKey, context.CancellationToken);

        var tempFilePath = $"{Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString(), asset.Filename)}";
        if (!Directory.Exists(Path.GetDirectoryName(tempFilePath)))
            Directory.CreateDirectory(Path.GetDirectoryName(tempFilePath));

        if (fileStream.CanSeek)
            fileStream.Seek(0, SeekOrigin.Begin);

        await using (var f = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await fileStream.CopyToAsync(f);
            await f.FlushAsync();
        }

        // critical to upload to pinata
        var ipfs = await _pinataClient.PinFileToIPFSAsync(tempFilePath);

        try
        {
            // anything here is recoverable

            await _fileClient.UpdateFileMetadata(new()
            {
                ipfsPinHash = ipfs.IpfsHash,
                Name = $"{asset.UserId}_{asset.Filename}",
                KeyValues = new()
                {
                    { "tenant_id", asset.UserId },
                    { "asset_id", asset.Id },
                    { "content_type", asset.ContentType }
                }
            });

            if (File.Exists(tempFilePath))
                File.Delete(tempFilePath);

            if (Directory.Exists(Path.GetDirectoryName(tempFilePath)))
                Directory.Delete(Path.GetDirectoryName(tempFilePath));
        }
        catch (Exception e)
        {
            _logger.LogError(e, "failed to update pinata metadata or delete temp directory!");
        }


        var updater = _repository.Assets.Updater;
        var update = updater.Combine(
            updater.Set(x => x.CID, ipfs.IpfsHash),
            updater.Set(x => x.UpdatedOn, DateTimeOffset.UtcNow)
        );

        await _repository.Assets.Patch(x => x.Id == asset.Id, update, context.CancellationToken);
    }
}
