using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Shares.Operations;
using StakingArt.Infrastructure;

namespace StakingArt.Features.App.Shares;

[Authorize(AuthenticationSchemes = Constants.APP_SCHEME)]
[Route("app/[controller]")]
[ApiController]
public class SharesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<ShareContentResponse>> Share([FromBody] ShareContent request) => mediator.Send(request);

    [HttpGet("{ShareId}")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.NotFound)]
    public Task<Result<GetShareResponse>> GetShare(GetShare request) => mediator.Send(request);
}
