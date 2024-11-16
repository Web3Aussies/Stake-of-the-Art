using Newtonsoft.Json;
using Refit;

namespace StakingArt.Infrastructure.WorldCoin;

public enum VerificationLevel
{
    Orb,
    Device
}

public enum CredentialType
{
    Orb,
    Device
}

public class ProofValidationResult
{
    public bool Success { get; set; }
    public int Users { get; set; }
    public string Action { get; set; }

    [JsonProperty("created_at")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonProperty("max_uses")]
    public int MaxUsers { get; set; }
    [JsonProperty("nullifier_hash")]
    public string NullifierHash { get; set; }
}


public class VerifyProofRequest
{
    [JsonProperty("verification_level")]
    public string VerificationLevel { get; set; }

    [JsonProperty("proof")]
    public string Proof { get; set; }

    [JsonProperty("merkle_root")]
    public string MerkleRoot { get; set; }

    [JsonProperty("nullifier_hash")]
    public string NullifierHash { get; set; }

    [JsonProperty("credential_type")]
    public string CredentialType { get; set; }

    [JsonProperty("action")]
    public string Action { get; set; }

    [JsonProperty("signal_hash")]
    public string SignalHash { get; set; }
}

public interface WorldCoinClient
{
    [Post("/v2/verify/{AppId}")]
    Task<ProofValidationResult> Verify([AliasAs("AppId")] string AppId, [Body] VerifyProofRequest request);
}
