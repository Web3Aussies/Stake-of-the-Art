using Ardalis.Result;
using Ardalis.Result.FluentValidation;
using FluentValidation;
using MediatR;
using StakingArt.Features.Admin.Accounts.Shared;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.Admin.Accounts.Operations;

public class UpdateProfile : IRequest<Result<MeResponse>>
{
    public string Name { get; set; }
    public string Email { get; set; }

}


public class UpdateProfileValidator : AbstractValidator<UpdateProfile>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Name).NotEmpty();
    }
}


public class UpdateProfileHandler : IRequestHandler<UpdateProfile, Result<MeResponse>>
{
    readonly IRepository _repository;
    readonly IUserService _userService;
    readonly UpdateProfileValidator _validator;

    public UpdateProfileHandler(IRepository repository, IUserService userService, UpdateProfileValidator validator)
    {
        _repository = repository;
        _userService = userService;
        _validator = validator;
    }
    public async Task<Result<MeResponse>> Handle(UpdateProfile request, CancellationToken cancellationToken)
    {
        var validation = await _validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid)
        {
            return Result.Invalid(validation.AsErrors());
        }

        var profile = _repository.Get<User>(_repository.GetLoggedInUserId());

        if (profile is null) return Result.NotFound();

        var updater = _repository.Users.Updater;
        var update = updater.Combine(
            updater.Set(x => x.Email, request.Email.Trim()),
            updater.Set(x => x.Name, request.Name.Trim()),
            updater.Set(x => x.UpdatedOn, DateTimeOffset.UtcNow),
            updater.Set(x => x.Verifications.AcceptedTermsOn, DateTimeOffset.UtcNow)
        );

        await _repository.Users.Patch(x => x.Id == profile.Id, update, cancellationToken);

        await _userService.UpdateUser(profile.IdentityId, request.Name.Trim(), request.Email.Trim());

        // reload user from database
        profile = _repository.Get<User>(_repository.GetLoggedInUserId())!;

        return new MeResponse(profile);
    }
}