using Ardalis.Result;
using MediatR;
using StakingArt.Services;

namespace StakingArt.Features.App.Accounts.Operations;

public class GetLoginNonce : IRequest<Result<LoginNuanceResponse>>
{

}

public class LoginNuanceResponse
{
    public string Nonce { get; set; }
}

public class GetLoginNuanceHandler : IRequestHandler<GetLoginNonce, Result<LoginNuanceResponse>>
{
    readonly IRepository _repository;

    public GetLoginNuanceHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LoginNuanceResponse>> Handle(GetLoginNonce request, CancellationToken cancellationToken)
    {
        var model = await _repository.Nonces.Create(new()
        {
            IsUsed = false,
            CreatedOn = DateTimeOffset.UtcNow
        }, cancellationToken);

        return new LoginNuanceResponse
        {
            Nonce = model.Id
        };
    }
}