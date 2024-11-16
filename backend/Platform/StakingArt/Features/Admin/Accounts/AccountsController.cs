using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.Admin.Accounts.Operations;
using StakingArt.Features.Admin.Accounts.Shared;
using StakingArt.Infrastructure;

namespace StakingArt.Features.Admin.Accounts;

[Authorize(AuthenticationSchemes = Constants.PARTNER_SCHEME)]
[Route("admin/[controller]")]
[ApiController]
public class AccountsController(IMediator mediator) : ControllerBase
{

    [HttpGet]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<MeResponse>> GetMe(GetMe request) => mediator.Send(request);

}

