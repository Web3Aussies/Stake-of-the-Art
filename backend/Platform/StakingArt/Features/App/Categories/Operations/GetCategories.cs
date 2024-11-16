using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Categories.Operations;

public class GetCategories : IRequest<Result<SearchResponse<CategoryResponse>>>
{
    [FromQuery] public int Page { get; set; } = 1;
    [FromQuery] public int Limit { get; set; } = 100;
}

public class CategoryResponse
{
    public string Name { get; set; }
    public CategoryType Type { get; set; }

    public CategoryResponse(Category model)
    {
        Name = model.Name;
        Type = model.Type;
    }

}

public class GetCategoriesHandler : IRequestHandler<GetCategories, Result<SearchResponse<CategoryResponse>>>
{
    readonly IRepository _repository;

    public GetCategoriesHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<SearchResponse<CategoryResponse>>> Handle(GetCategories request, CancellationToken cancellationToken)
    {
        var filter = _repository.Categories.Filter;
        var filters = filter.Exists("Assets.0");

        var (result, total) = await _repository.Categories.Search(filters,
            _repository.Categories.Sorter.Ascending(x => x.Name),
            request.Page,
            request.Limit);

        return new SearchResponse<CategoryResponse>
        {
            Results = result.Select(x => new CategoryResponse(x)).ToList(),

            TotalRecords = total,
            Page = request.Page,
            Limit = request.Limit
        };
    }
}
