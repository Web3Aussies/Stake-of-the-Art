using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using StakingArt.Models.Shared;

namespace StakingArt.Models;

public class Share: AuditableEntity, ITenantEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string UserId { get; set; }

    public string Filename { get; set; }
    public string ContentType { get; set; }
    public long FileSizeBytes { get; set; }

    public Dictionary<string, string> Meta { get; set; } = new();

    public FileStatus Status { get; set; }

    public string BucketName { get; set; }
    public string ObjectKey { get; set; }
}
