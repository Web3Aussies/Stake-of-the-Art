using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StakingArt.Models;

public class User
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    public string IdentityId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }

    public DateTimeOffset CreatedOn { get; set; }
    public DateTimeOffset? UpdatedOn { get; set; }
    public UserVerifications Verifications { get; set; } = new();

    public List<string> LikedAssets { get; set; } = new();
    public UserWallet Wallet { get; set; }
}

public class UserVerifications
{
    public bool EmailVerified { get; set; }
    public DateTimeOffset? EmailVerifiedOn { get; set; }

    public DateTimeOffset? AcceptedTermsOn { get; set; }
}

public class UserWallet
{
    public string? Seed { get; set; }
    public string Address { get; set; }
}

public enum UserRole
{
    Partner,
    User
}