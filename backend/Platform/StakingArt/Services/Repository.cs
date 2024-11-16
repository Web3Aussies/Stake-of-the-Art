using MongoDB.Driver;
using StakingArt.Infrastructure.Extensions;
using StakingArt.Infrastructure.Mongodb;
using StakingArt.Models;
using StakingArt.Models.Shared;

namespace StakingArt.Services;

public interface IRepository
{
    ModelSet<User> Users { get; }
    ModelSet<Asset> Assets { get; }
    ModelSet<Category> Categories { get; }
    ModelSet<Nonce> Nonces { get; }
    ModelSet<Download> Downloads { get; }
    ModelSet<Share> Shares { get; }
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
        Assets = new(database, "assets");
        Categories = new(database, "categories");
        Nonces = new(database, "nonces");
        Downloads = new(database, "downloads");
        Shares = new(database, "shares");
    }

    public ModelSet<User> Users { get; }
    public ModelSet<Asset> Assets { get; }
    public ModelSet<Category> Categories { get; }
    public ModelSet<Nonce> Nonces { get; }
    public ModelSet<Download> Downloads { get; }
    public ModelSet<Share> Shares { get; }

    public TModel? Get<TModel>(string id, bool forTenant = false) where TModel : class, new()
    {
        if (forTenant)
        {
            var userId = GetLoggedInUserId();
            if (string.IsNullOrWhiteSpace(userId)) throw new InvalidOperationException($"User is not logged in!");

            return new TModel() switch
            {
                Asset => Assets.Collection.Find(Assets.Filter.Eq(x => x.Id, id) & Assets.Filter.Eq(x => x.UserId, userId)).SingleOrDefault() as TModel,
                _ => throw new ArgumentOutOfRangeException()
            };
        }

        return new TModel() switch
        {
            User => Users.Collection.Find(Users.Filter.Eq(x => x.Id, id)).SingleOrDefault() as TModel,
            Nonce => Nonces.Collection.Find(Nonces.Filter.Eq(x => x.Id, id)).SingleOrDefault() as TModel,
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
