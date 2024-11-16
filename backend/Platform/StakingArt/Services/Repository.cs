using MongoDB.Driver;
using StakingArt.Infrastructure.Extensions;
using StakingArt.Infrastructure.Mongodb;
using StakingArt.Models;
using StakingArt.Models.Shared;

namespace StakingArt.Services;

public interface IRepository
{
    ModelSet<User> Users { get; }
    TModel? Get<TModel>(string id, bool forTenant = false) where TModel : class, new();
    string? GetLoggedInUserId();
    UserDto? GetLoggedInUserDto();
}

public class Repository : IRepository
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public Repository(IHttpContextAccessor httpContextAccessor, IMongoClient client, DatabaseOptions dbOptions)
    {
        _httpContextAccessor = httpContextAccessor;

        var database = client.GetDatabase(dbOptions.DatabaseName);

        Users = new(database, "users");

    }

    public ModelSet<User> Users { get; }

    public TModel? Get<TModel>(string id, bool forTenant = false) where TModel : class, new()
    {
        if (forTenant)
        {
            var userId = GetLoggedInUserId();
            if (string.IsNullOrWhiteSpace(userId)) throw new InvalidOperationException($"User is not logged in!");

            return new TModel() switch
            {
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        return new TModel() switch
        {
            User => Users.Collection.Find(Users.Filter.Eq(x => x.Id, id)).SingleOrDefault() as TModel,
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    public string? GetLoggedInUserId()
    {
        return _httpContextAccessor.GetUserId();
    }

    public UserDto? GetLoggedInUserDto()
    {
        var userId = _httpContextAccessor.GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return null;

        var user = Get<User>(userId);
        if (user is null) return null;

        return new(user.Id, user.Name);
    }
}
