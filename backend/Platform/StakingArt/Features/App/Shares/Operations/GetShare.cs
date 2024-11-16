using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Shares.Operations;

public class GetShare : IRequest<Result<GetShareResponse>>
{
    [FromRoute] public string ShareId { get; set; }
}

public class GetShareResponse
{
    public string ShareId { get; set; }
    public FileStatus Status { get; set; }
    public string Url { get; set; }
}

public class GetShareHandler : IRequestHandler<GetShare, Result<GetShareResponse>>
{
    readonly IRepository _repository;
    readonly IStorageService _storageService;

    public GetShareHandler(IRepository repository, IStorageService storageService)
    {
        _repository = repository;
        _storageService = storageService;
    }
    public async Task<Result<GetShareResponse>> Handle(GetShare request, CancellationToken cancellationToken)
    {
        var share = await _repository.Shares.Find(x => x.Id, request.ShareId, cancellationToken);
        if (share is null) return Result.NotFound();

        var url = await _storageService.GetDownloadSignedUrl(share.ObjectKey);

        return new GetShareResponse
        {
            ShareId = share.Id,
            Status = share.Status,
            Url = url
        };
    }
}
