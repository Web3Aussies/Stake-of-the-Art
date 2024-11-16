using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Categories.Operations;
using StakingArt.Features.Shared;
using StakingArt.Infrastructure;

namespace StakingArt.Features.App.Categories;

[Authorize(AuthenticationSchemes = Constants.APP_SCHEME)]
[Route("app/[controller]")]
[ApiController]
public class CategoriesController(IMediator mediator) : ControllerBase
{

    [HttpGet]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<SearchResponse<CategoryResponse>>> GetCategories(GetCategories request)
        => mediator.Send(request);
}
