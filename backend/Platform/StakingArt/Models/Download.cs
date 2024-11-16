using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using StakingArt.Models.Shared;

namespace StakingArt.Models;

public class Download : AuditableEntity, ITenantEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string UserId { get; set; }
    public string AssetId { get; set; }

    public int Year { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public DateTimeOffset? PaidOn { get; set; }
}
