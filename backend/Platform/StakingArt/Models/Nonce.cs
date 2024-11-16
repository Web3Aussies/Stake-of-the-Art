using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StakingArt.Models;

public class Nonce
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public bool IsUsed { get; set; }
    public DateTimeOffset? UsedOn { get; set; }

    public DateTimeOffset CreatedOn { get; set; }
}
