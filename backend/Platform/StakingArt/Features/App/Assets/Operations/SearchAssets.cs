using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using StakingArt.Features.App.Assets.Shared;
using StakingArt.Features.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class SearchAssets : IRequest<Result<SearchResponse<AssetResponse>>>
{
    [FromQuery] public bool? IsLiked { get; set; }
    [FromQuery] public string? Keyword { get; set; }
    [FromQuery] public string? Categories { get; set; }
    [FromQuery] public int Page { get; set; } = 1;
    [FromQuery] public int Limit { get; set; } = 100;
    [FromQuery] public int Width { get; set; } = 200;
    [FromQuery] public int Height { get; set; } = 200;


}

public class SearchAssetsHandle : IRequestHandler<SearchAssets, Result<SearchResponse<AssetResponse>>>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;

    public SearchAssetsHandle(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }
    public async Task<Result<SearchResponse<AssetResponse>>> Handle(SearchAssets request, CancellationToken cancellationToken)
    {
        var filter = _repository.Assets.Filter;

        var filters = filter.Eq(x => x.Status, FileStatus.Ready);

        // filter by liked asset
        if (request.IsLiked.HasValue && request.IsLiked.Value)
        {
            var user = _repository.Get<User>(_repository.GetLoggedInUserId())!;

            filters &= filter.In(x => x.Id, user.LikedAssets);
        }

        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            filters &= filter.Regex(p => p.Description, new BsonRegularExpression(request.Keyword, "i"));
        }

        if (request.Categories is not null && request.Categories.Split(',').Length > 0)
        {
            var categories = request.Categories.Split(',').Select(x => x.Trim());
            // get the asset ids for all these categories, then distinct them, then load the assets that matched
            var cFilter = _repository.Categories.Filter;
            var cFilters = cFilter.In(x => x.Name, categories);

            var caseInsensitiveCollation = new Collation(
                locale: "en",
                strength: CollationStrength.Secondary
            );

            var cList = await _repository.Categories.Collection

                .Find(cFilters, new FindOptions
                {
                    Collation = caseInsensitiveCollation
                })

                .ToListAsync(cancellationToken: cancellationToken)

                ;
            var assetIds = cList.SelectMany(x => x.Assets).Distinct().ToList();
            if (assetIds.Count > 0)
                filters &= filter.In(x => x.Id, assetIds);

            else filters = filter.Eq(x => x.Id, ObjectId.Empty.ToString());
        }

        var (result, total) = await _repository.Assets.Search(
            filters,
            _repository.Assets.Sorter.Descending(x => x.CreatedBy),
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
