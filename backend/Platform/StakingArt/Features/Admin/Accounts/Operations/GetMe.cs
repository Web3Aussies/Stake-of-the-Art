using Ardalis.Result;
using MediatR;
using StakingArt.Features.Admin.Accounts.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.Admin.Accounts.Operations;

public class GetMe : IRequest<Result<MeResponse>>
{
}

public class GetMeHandler : IRequestHandler<GetMe, Result<MeResponse>>
{
    readonly IRepository _repository;

    public GetMeHandler(IRepository repository)
    {
        _repository = repository;
    }
    public async Task<Result<MeResponse>> Handle(GetMe request, CancellationToken cancellationToken)
    {
        var profile = _repository.Get<User>(_repository.GetLoggedInUserId());
        return new MeResponse(profile);
    }
}
