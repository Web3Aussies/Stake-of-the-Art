using Ardalis.Result;
using MediatR;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.Admin.Assets.Operations;

public class AddAsset : IRequest<Result<AddAssetResponse>>
{
    public string Filename { get; set; }
    public string ContentType { get; set; }

    public Dictionary<string, string>? Meta { get; set; }
}

public class AddAssetResponse
{
    public string AssetId { get; set; }
    public string UploadUrl { get; set; }
}

public class AddAssetHandler : IRequestHandler<AddAsset, Result<AddAssetResponse>>
{
    readonly IRepository _repository;
    readonly IStorageService _storageService;

    public AddAssetHandler(IRepository repository, IStorageService storageService)
    {
        _repository = repository;
        _storageService = storageService;
    }
    public async Task<Result<AddAssetResponse>> Handle(AddAsset request, CancellationToken cancellationToken)
    {
        var asset = await _repository.Assets.Create(new()
        {
            Filename = request.Filename,
            ContentType = request.ContentType,
            Status = FileStatus.Pending,
            Meta = request.Meta ?? new(),

            UserId = _repository.GetLoggedInUserId(),
            CreatedBy = _repository.GetLoggedInUserDto(),
        }, cancellationToken);

        var key = $"{asset.UserId}/{asset.Id}{Path.GetExtension(asset.Filename)}";

        var uploadLink = await _storageService.GetUploadSignedUrl(key, asset.ContentType, asset.Meta);

        return new AddAssetResponse
        {
            AssetId = asset.Id,
            UploadUrl = uploadLink
        };
    }
}
