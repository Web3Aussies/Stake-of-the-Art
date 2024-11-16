using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.Platform.Categories.Operations;
using StakingArt.Infrastructure;

namespace StakingArt.Features.Platform.Categories;

[Authorize(AuthenticationSchemes = Constants.PARTNER_SCHEME)]
[Route("platform/[controller]")]
[ApiController]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<CategoryResponse>> AddCategory([FromBody] AddCategory request) => mediator.Send(request);
}
