using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Accounts.Operations;
using StakingArt.Infrastructure;

namespace StakingArt.Features.App.Accounts;

[Authorize(AuthenticationSchemes = Constants.APP_SCHEME)]
[Route("app/[controller]")]
[ApiController]
public class AccountsController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("nonce")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<LoginNuanceResponse>> GetNonce() => mediator.Send(new GetLoginNonce());

    [AllowAnonymous]
    [HttpPost("login")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Invalid, ResultStatus.NotFound)]
    public Task<Result<LoginUserResponse>> Login([FromBody] LoginUser request) => mediator.Send(request);

    [AllowAnonymous]
    [HttpPost("world/login")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Invalid, ResultStatus.NotFound)]
    public Task<Result<LoginUserResponse>> WorldLogin([FromBody] LoginWorldUser request) => mediator.Send(request);
}
