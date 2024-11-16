using StakingArt.Infrastructure.WorldCoin;

namespace StakingArt.Services;

public interface IWorldCoinService
{
    Task<bool> IsProofValid(VerificationLevel verificationLevel,
        string proof,
        string merkleRoot,
        string nullifierHash,
        CredentialType credentialType,
        string signal);
}
public class WorldCoinService : IWorldCoinService
{
    readonly WorldCoinClient _client;
    readonly HashUtil _hashUtil;
    readonly WorldCoinOptions _options;

    public WorldCoinService(WorldCoinClient client, HashUtil hashUtil, WorldCoinOptions options)
    {
        _client = client;
        _hashUtil = hashUtil;
        _options = options;
    }


    public async Task<bool> IsProofValid(
        VerificationLevel verificationLevel,
        string proof,
        string merkleRoot,
        string nullifierHash,
        CredentialType credentialType,
        string signal)
    {
        var request = new VerifyProofRequest()
        {
            VerificationLevel = verificationLevel.ToString().ToLower(),
            Proof = proof,
            MerkleRoot = merkleRoot,
            NullifierHash = nullifierHash,
            CredentialType = credentialType.ToString().ToLower(),

            Action = _options.AttestationAction,
            SignalHash = _hashUtil.HashString(signal).Digest
        };
        var result = await _client.Verify(_options.AppId, request);

        return result.Success;
    }
}
