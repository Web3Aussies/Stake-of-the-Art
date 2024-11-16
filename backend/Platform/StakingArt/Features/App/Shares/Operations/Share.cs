using Ardalis.Result;
using MediatR;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Shares.Operations;

public class ShareContent : IRequest<Result<ShareContentResponse>>
{
    public string FileName { get; set; }
    public string ContentType { get; set; }
}

public class ShareContentResponse
{
    public string ShareId { get; set; }
    public string UploadUrl { get; set; }
}


public class ShareContentHandler : IRequestHandler<ShareContent, Result<ShareContentResponse>>
{
    readonly IRepository _repository;
    readonly IStorageService _storageService;

    public ShareContentHandler(IRepository repository, IStorageService storageService)
    {
        _repository = repository;
        _storageService = storageService;
    }

    public async Task<Result<ShareContentResponse>> Handle(ShareContent request, CancellationToken cancellationToken)
    {
        var share = await _repository.Shares.Create(new()
        {
            Filename = request.FileName,
            ContentType = request.ContentType,
            Status = FileStatus.Pending,

            UserId = _repository.GetLoggedInUserId(),
            CreatedBy = _repository.GetLoggedInUserDto(),
        });

        var key = $"{share.UserId}/shares/{share.Id}{Path.GetExtension(share.Filename)}";

        var uploadLink = await _storageService.GetUploadSignedUrl(key, request.ContentType, share.Meta);

        return new ShareContentResponse
        {
            ShareId = share.Id,
            UploadUrl = uploadLink
        };
    }
}