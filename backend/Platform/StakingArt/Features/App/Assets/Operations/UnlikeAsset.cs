using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class UnlikeAsset : IRequest<Result>
{
    [FromRoute] public string AssetId { get; set; }
    [FromQuery] public int Width { get; set; } = 200;
    [FromQuery] public int Height { get; set; } = 200;
}

public class UnlikeAssetHandler : IRequestHandler<UnlikeAsset, Result>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;
    public UnlikeAssetHandler(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }
    public async Task<Result> Handle(UnlikeAsset request, CancellationToken cancellationToken)
    {
        var user = _repository.Get<User>(_repository.GetLoggedInUserId())!;

        if (user.LikedAssets.Contains(request.AssetId))
        {
            var update = _repository.Users.Updater.Pull(x => x.LikedAssets, request.AssetId);
            await _repository.Users.Patch(x => x.Id == user.Id, update, cancellationToken);
        }

        return Result.Success();
    }
}
