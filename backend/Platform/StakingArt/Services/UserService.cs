using System.Text;
using StakingArt.Infrastructure.Security;
using StakingArt.Models;

namespace StakingArt.Services;

public interface IUserService
{
    Task<User> EnrollUser(string identityId, UserRole role);
    Task UpdateUser(string identityId, string name, string email);
}

public class UserService : IUserService
{
    readonly IRepository _repository;
    readonly ManagementClientFactory _managementClientFactory;


    public UserService(IRepository repository, ManagementClientFactory managementClientFactory)
    {
        _repository = repository;
        _managementClientFactory = managementClientFactory;

    }

    public async Task<User> EnrollUser(string identityId, UserRole role)
    {
        // ensure user does not exists
        var user = await _repository.Users.Find(x => x.IdentityId, identityId, CancellationToken.None);
        if (user != null) return user;

        user = new()
        {
            IdentityId = identityId,
            
            Role = role,

            CreatedOn = DateTimeOffset.UtcNow
        };

        if (role == UserRole.Partner)
        {
            // get user from auth0 using management api

            var client = await _managementClientFactory.GetClient();
            var mUser = await client.Users.GetAsync(identityId);

            user.Name = mUser.FullName;
            user.Email = mUser.Email;

            user.Verifications = new()
            {
                EmailVerified = mUser.EmailVerified ?? false,
                EmailVerifiedOn = mUser.EmailVerified.GetValueOrDefault(false) ? DateTimeOffset.UtcNow : null
            };
        }
        
        user = await _repository.Users.Create(user);

        return user;
    }

    


    public async Task UpdateUser(string identityId, string name, string email)
    {
        var client = await _managementClientFactory.GetClient();

        await client.Users.UpdateAsync(identityId, new()
        {
            UserMetadata = new
            {
                Name = name,
                Email = email,
                AcceptedOn = DateTimeOffset.UtcNow
            }
        });


    }
}
