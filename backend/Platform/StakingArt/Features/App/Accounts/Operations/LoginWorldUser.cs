using Ardalis.Result;
using MediatR;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Accounts.Operations;

public class LoginWorldUser : IRequest<Result<LoginUserResponse>>
{
    public string Nonce { get; set; }
    public string Message { get; set; }
    public string Signature { get; set; }
    public string Address { get; set; }
}

public class LoginWorldUserHandler : IRequestHandler<LoginWorldUser, Result<LoginUserResponse>>
{
    readonly IRepository _repository;
    readonly ISecurityService _securityService;
    readonly IUserService _userService;


    public LoginWorldUserHandler(
        IRepository repository,
        ISecurityService securityService,
        IUserService userService)
    {
        _repository = repository;
        _securityService = securityService;
        _userService = userService;
    }
    public async Task<Result<LoginUserResponse>> Handle(LoginWorldUser request, CancellationToken cancellationToken)
    {
        // ensure nuance is still valid 
        var nonce = _repository.Get<Nonce>(request.Nonce);
        if (nonce is null)
            return Result.NotFound();

        if (nonce.IsUsed)
            return Result.Invalid(new ValidationError("Invalid Nonce!"));

        if (nonce.CreatedOn < DateTimeOffset.UtcNow.AddHours(-1))
            return Result.Invalid(new ValidationError("Nonce expired!"));

        //TODO: validate the login signiture

        var address = request.Address;

        // we have a valid address and signature
        // enroll user if not already exists
        var user = await _repository.Users.Find(x => x.IdentityId, address, cancellationToken);
        if (user is null)
        {
            user = await _userService.EnrollUser(address, UserRole.User);

            var wallet = new UserWallet { Address = address };
            var uUpdater = _repository.Users.Updater;
            var uUpdate = uUpdater.Combine(
                uUpdater.Set(x => x.Wallet, wallet),
                uUpdater.Set(x => x.UpdatedOn, DateTimeOffset.UtcNow)
            );
            await _repository.Users.Patch(x => x.Id == user.Id, uUpdate, cancellationToken);
        }

        var (token, expiresIn) = _securityService.GenerateJwtToken(user.Id);

        var updater = _repository.Nonces.Updater;
        var update = updater.Combine(
            updater.Set(x => x.IsUsed, true),
            updater.Set(x => x.UsedOn, DateTimeOffset.UtcNow)
        );
        await _repository.Nonces.Patch(x => x.Id == nonce.Id, update, cancellationToken);

        return new LoginUserResponse
        {
            Token = token,
            ExpiresIn = expiresIn
        };
    }
}
