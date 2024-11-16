using Ardalis.Result;
using MediatR;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.Platform.Categories.Operations;

public class AddCategory : IRequest<Result<CategoryResponse>>
{
    public string? Name { get; set; }
    public string? Names { get; set; }
    public CategoryType Type { get; set; }
}

public class CategoryResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public CategoryType Type { get; set; }

    public CategoryResponse(Category m)
    {
        Id = m.Id;
        Name = m.Name;
        Type = m.Type;
    }
}

public class AddCategoryHandler : IRequestHandler<AddCategory, Result<CategoryResponse>>
{
    readonly IRepository _repository;

    public AddCategoryHandler(IRepository repository)
    {
        _repository = repository;
    }
    public async Task<Result<CategoryResponse>> Handle(AddCategory request, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(request.Name))
        {
            var model = await _repository.Categories.Create(new()
            {
                Name = request.Name,
                Type = request.Type
            }, cancellationToken);

            return new CategoryResponse(model);
        }
        else if (!string.IsNullOrWhiteSpace(request.Names))
        {
            foreach (var name in request.Names.Split(','))
            {
                var model = await _repository.Categories.Create(new()
                {
                    Name = name.Trim(),
                    Type = request.Type
                }, cancellationToken);
            }

            return Result.Success();
        }

        return Result.Invalid();


    }
}
