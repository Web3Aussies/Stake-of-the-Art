using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Assets.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class LikeAsset : IRequest<Result<AssetResponse>>
{
    [FromRoute] public string AssetId { get; set; }
    [FromQuery] public int Width { get; set; } = 200;
    [FromQuery] public int Height { get; set; } = 200;
}

public class LikeAssetHandler : IRequestHandler<LikeAsset, Result<AssetResponse>>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;

    public LikeAssetHandler(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }
    public async Task<Result<AssetResponse>> Handle(LikeAsset request, CancellationToken cancellationToken)
    {
        var user = _repository.Get<User>(_repository.GetLoggedInUserId())!;

        var asset = await _repository.Assets.Find(x => x.Id, request.AssetId, cancellationToken);
        if (asset is not { Status: FileStatus.Ready })
        {
            return Result.Invalid();
        }

        if (!user.LikedAssets.Contains(request.AssetId))
        {
            var update = _repository.Users.Updater.AddToSet(x => x.LikedAssets, request.AssetId);
            await _repository.Users.Patch(x => x.Id == user.Id, update, cancellationToken);
        }
        
        return new AssetResponse(asset)
        {
            ImageUrl = await _imageService.GetEncodedSignedImageUrl(asset.ObjectKey, request.Width, request.Height)
        };
    }
}
