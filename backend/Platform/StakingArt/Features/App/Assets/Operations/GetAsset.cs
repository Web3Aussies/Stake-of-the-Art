using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Assets.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class GetAsset : IRequest<Result<AssetResponse>>
{
    [FromRoute] public string AssetId { get; set; }
    [FromQuery] public int Width { get; set; } = 400;
    [FromQuery] public int Height { get; set; } = 400;
}

public class GetAssetHandler : IRequestHandler<GetAsset, Result<AssetResponse>>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;

    public GetAssetHandler(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }
    public async Task<Result<AssetResponse>> Handle(GetAsset request, CancellationToken cancellationToken)
    {
        var asset = await _repository.Assets.Find(x => x.Id, request.AssetId, cancellationToken);
        if (asset is null || asset.Status != FileStatus.Ready) return Result.NotFound();
        
        return new AssetResponse(asset)
        {
            ImageUrl = await _imageService.GetEncodedSignedImageUrl(asset.ObjectKey, request.Width, request.Height)
        };
    }
}
