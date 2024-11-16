using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using StakingArt.Features.App.Assets.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Assets.Operations;

public class GetRandomAsset : IRequest<Result<ICollection<AssetResponse>>>
{
    [FromQuery] public string? Categories { get; set; }
    [FromQuery] public int Limit { get; set; } = 1;
    [FromQuery] public int Width { get; set; } = 200;
    [FromQuery] public int Height { get; set; } = 200;
}

public class GetRandomAssetHandler : IRequestHandler<GetRandomAsset, Result<ICollection<AssetResponse>>>
{
    readonly IRepository _repository;
    readonly ImageService _imageService;

    public GetRandomAssetHandler(IRepository repository, ImageService imageService)
    {
        _repository = repository;
        _imageService = imageService;
    }

    public async Task<Result<ICollection<AssetResponse>>> Handle(GetRandomAsset request, CancellationToken cancellationToken)
    {
        var filter = _repository.Assets.Filter;
        var filters = filter.Eq(x => x.Status, FileStatus.Ready);

        if (request.Categories is not null && !string.IsNullOrWhiteSpace(request.Categories))
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

        var project = Builders<Asset>.Projection.Include(x => x.Id);
        var ids = await _repository.Assets.Collection
            .Find(filters)
            .Limit(1000)
            .Project(project)
            .ToListAsync(cancellationToken: cancellationToken);

        var idList = ids.Select(x => x.GetValue("_id").AsObjectId.ToString()).ToList();

        var selected = new List<string>();

        if (idList.Count < request.Limit)
        {
            request.Limit = idList.Count;
            selected.AddRange(idList);
        }
        else
        {
            var random = new Random();
            while (selected.Count < request.Limit)
            {
                var rnd = random.Next(0, idList.Count);
                var matched = idList[rnd];
                if (!selected.Contains(matched))
                {
                    selected.Add(matched);
                }
            }
        }

        var selectedFilter = _repository.Assets.Filter.In(x => x.Id, selected);
        var assets = await _repository.Assets.Collection
            .Find(selectedFilter)
            .ToListAsync(cancellationToken: cancellationToken);

        return await Task.WhenAll(assets.Select(async x => new AssetResponse(x)
        {
            ImageUrl = await _imageService.GetEncodedSignedImageUrl(x.ObjectKey, request.Width, request.Height)
        }));
    }
}
