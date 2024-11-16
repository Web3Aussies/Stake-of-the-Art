using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class DownloadAsset : IRequest<Result<string>>
{
    [FromRoute] public string AssetId { get; set; }
}

public class DownloadAssetHandler : IRequestHandler<DownloadAsset, Result<string>>
{
    readonly IRepository _repository;
    readonly IStorageService _storageService;

    public DownloadAssetHandler(IRepository repository, IStorageService storageService)
    {
        _repository = repository;
        _storageService = storageService;
    }

    public async Task<Result<string>> Handle(DownloadAsset request, CancellationToken cancellationToken)
    {
        var asset = await _repository.Assets.Find(x => x.Id, request.AssetId, cancellationToken);
        if (asset is null) return Result.NotFound();
        if (asset.Status != FileStatus.Ready) return Result.NotFound();

        
        var update=_repository.Assets.Updater.Inc(x => x.TotalDownloadCount, 1);
        await _repository.Assets.Patch(x => x.Id == asset.Id, update, cancellationToken);
        
        
        _repository.Downloads.Create(new()
        {
            UserId = asset.UserId,
            AssetId = asset.Id,

            Year = DateTimeOffset.UtcNow.Year,
            Month = DateTimeOffset.UtcNow.Month,
            Day = DateTimeOffset.UtcNow.Day,

            CreatedBy = _repository.GetLoggedInUserDto(),
        });

        return await _storageService.GetDownloadSignedUrl(asset.ObjectKey);
    }
}
