using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using StakingArt.Infrastructure.WorldCoin;
using StakingArt.Models.Shared;

namespace StakingArt.Models;

public class Asset : AuditableEntity, ITenantEntity
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string UserId { get; set; }

    public string Title { get; set; }
    public string Description { get; set; }

    public string Filename { get; set; }
    public string ContentType { get; set; }
    public long FileSizeBytes { get; set; }

    public Dictionary<string, string> Meta { get; set; } = new();

    public FileStatus Status { get; set; }

    public string BucketName { get; set; }
    public string ObjectKey { get; set; }

    public int TotalDownloadCount { get; set; }

    public Attestation Attestation { get; set; }
    public string CID { get; set; }

    public ICollection<AssetCategory> Categories { get; set; }
    public AssetColour Colour { get; set; }
}

public enum FileStatus
{
    Pending,    // pending upload
    Sign,       // pending attestation
    Ready,      // ready
    Deactivated // not been shown
}

public class Attestation
{
    public VerificationLevel VerificationLevel { get; set; }
    public string Proof { get; set; }
    public string MerkleRoot { get; set; }
    public string NullifierHash { get; set; }
    public CredentialType CredentialType { get; set; }
}

public record AssetCategory(string Name, int Score);
public record AssetColour(string Name, int Score);