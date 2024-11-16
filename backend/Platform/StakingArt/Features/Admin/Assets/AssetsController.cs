using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.Admin.Assets.Operations;
using StakingArt.Features.Admin.Assets.Shared;
using StakingArt.Features.Shared;
using StakingArt.Infrastructure;

namespace StakingArt.Features.Admin.Assets;

[Authorize(AuthenticationSchemes = Constants.PARTNER_SCHEME)]
[Route("admin/[controller]")]
[ApiController]
public class AssetsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<SearchResponse<AssetResponse>>> Search(SearchAssets request) => mediator.Send(request);

    [HttpPost]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Invalid)]
    public Task<Result<AddAssetResponse>> AddAsset([FromBody] AddAsset request) => mediator.Send(request);

    [HttpGet("{AssetId}")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.NotFound)]
    public Task<Result<AssetResponse>> GetAsset(GetAsset request) => mediator.Send(request);

    [HttpPost("{AssetId}/sign")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.NotFound)]
    public Task<Result> Sign(SignAsset request) => mediator.Send(request);

}
