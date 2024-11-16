using Ardalis.Result;
using Ardalis.Result.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Features.App.Assets.Operations;
using StakingArt.Features.App.Assets.Shared;
using StakingArt.Features.Shared;
using StakingArt.Infrastructure;

namespace StakingArt.Features.App.Assets;

[Authorize(AuthenticationSchemes = Constants.APP_SCHEME)]
[Route("app/[controller]")]
[ApiController]
public class AssetsController(IMediator mediator) : ControllerBase
{

    [HttpGet]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<SearchResponse<AssetResponse>>> Search(SearchAssets request) => mediator.Send(request);

    [HttpGet("{AssetId}")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.NotFound)]
    public Task<Result<AssetResponse>> GetAsset(GetAsset request) => mediator.Send(request);


    [HttpPost("{AssetId}/download")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.NotFound)]
    public Task<Result<string>> GetDownloadLink(DownloadAsset request) => mediator.Send(request);

    // endpoint to accept liked action
    [HttpPost("{AssetId}/like")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Invalid)]
    public Task<Result<AssetResponse>> Like(LikeAsset request) => mediator.Send(request);

    [HttpPost("{AssetId}/unlike")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result> Unlike(UnlikeAsset request) => mediator.Send(request);

    [HttpGet("random")]
    [TranslateResultToActionResult]
    [ExpectedFailures(ResultStatus.Ok)]
    public Task<Result<ICollection<AssetResponse>>> GetRandom(GetRandomAsset request) => mediator.Send(request);
}
