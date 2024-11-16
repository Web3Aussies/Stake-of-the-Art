using Ardalis.Result;
using MediatR;
using Nethereum.Signer;
using Nethereum.Util;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.App.Accounts.Operations;

public class LoginUser : IRequest<Result<LoginUserResponse>>
{
    public string Nuance { get; set; }
    public string Signature { get; set; }
    public string Address { get; set; }
}

public class LoginUserResponse
{
    public string Token { get; set; }
    public long ExpiresIn { get; set; }
}

public class LoginUserHandler : IRequestHandler<LoginUser, Result<LoginUserResponse>>
{
    readonly IRepository _repository;
    readonly ISecurityService _securityService;
    readonly IUserService _userService;

    public LoginUserHandler(IRepository repository, ISecurityService securityService, IUserService userService)
    {
        _repository = repository;
        _securityService = securityService;
        _userService = userService;
    }

    public static byte[] ComputeKeccak256Hash(string message)
    {
        var sha3 = new Sha3Keccack();
        byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(message);
        byte[] hashBytes = sha3.CalculateHash(messageBytes);
        return hashBytes;
        //return "0x" + ByteArrayToHexString(hashBytes);
    }

    public static string ByteArrayToHexString(byte[] byteArray)
    {
        return BitConverter.ToString(byteArray).Replace("-", "").ToLower();
    }

    public async Task<Result<LoginUserResponse>> Handle(LoginUser request, CancellationToken cancellationToken)
    {
        // ensure nuance is still valid 
        var nonce = _repository.Get<Nonce>(request.Nuance);
        if (nonce is null)
            return Result.NotFound();

        if (nonce.IsUsed)
            return Result.Invalid(new ValidationError("Invalid Nonce!"));

        if (nonce.CreatedOn < DateTimeOffset.UtcNow.AddHours(-1))
            return Result.Invalid(new ValidationError("Nonce expired!"));

        var signer = new EthereumMessageSigner();

        var x = signer.EcRecover(ComputeKeccak256Hash(request.Nuance), request.Signature);

        var recoveredAddress = signer.EncodeUTF8AndEcRecover(request.Nuance, request.Signature);

        // Compare the recovered address with the provided address (case-insensitive)
        if (!string.Equals(recoveredAddress, request.Address, StringComparison.OrdinalIgnoreCase))
            return Result.Invalid(new ValidationError("Failed to validate signature!"));

        // we have a valid address and signature
        // enroll user if not already exists
        var user = await _repository.Users.Find(x => x.IdentityId, recoveredAddress, cancellationToken);
        if (user is null)
        {
            user = await _userService.EnrollUser(recoveredAddress, UserRole.User);

            var wallet = new UserWallet { Address = recoveredAddress };
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