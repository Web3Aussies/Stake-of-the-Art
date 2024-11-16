using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.Admin.Assets.Shared;
using StakingArt.Features.Shared;
using StakingArt.Services;

namespace StakingArt.Features.Admin.Assets.Operations;

public class SearchAssets : IRequest<Result<SearchResponse<AssetResponse>>>
{
    [FromQuery] public int Page { get; set; }
    [FromQuery] public int Limit { get; set; }
    [FromQuery] public int Width { get; set; } = 200;
    [FromQuery] public int Height { get; set; } = 200;
}

public class SearchAssetsHandler : IRequestHandler<SearchAssets, Result<SearchResponse<AssetResponse>>>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;

    public SearchAssetsHandler(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }
    public async Task<Result<SearchResponse<AssetResponse>>> Handle(SearchAssets request, CancellationToken cancellationToken)
    {
        var filter = _repository.Assets.Filter;
        var filters = filter.Eq(x => x.UserId, _repository.GetLoggedInUserId());


        var (result, total) = await _repository.Assets.Search(
            filters,
            _repository.Assets.Sorter.Descending(x => x.CreatedOn),
            request.Page,
            request.Limit);


        return new SearchResponse<AssetResponse>
        {
            Results = await Task.WhenAll(result.Select(async asset => new AssetResponse(asset)
            {
                ImageUrl = await _imageService.GetEncodedSignedImageUrl(asset.ObjectKey, request.Width, request.Height)
            })),
            TotalRecords = total,
            Page = request.Page,
            Limit = request.Limit
        };
    }
}
