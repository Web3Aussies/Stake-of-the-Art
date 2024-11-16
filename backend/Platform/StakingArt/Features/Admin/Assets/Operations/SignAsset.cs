using Ardalis.Result;
using MassTransit;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using StakingArt.Infrastructure.WorldCoin;
using StakingArt.Messages;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Features.Admin.Assets.Operations;

public class SignAsset : IRequest<Result>
{
    [FromRoute] public string AssetId { get; set; }
    [FromBody] public SignPayload Payload { get; set; }
}

public class SignPayload
{
    [JsonProperty("verification_level")]
    public VerificationLevel VerificationLevel { get; set; }

    public string Proof { get; set; }

    [JsonProperty("merkle_root")]
    public string MerkleRoot { get; set; }

    [JsonProperty("nullifier_hash")]
    public string NullifierHash { get; set; }


    [JsonProperty("credential_type")]
    public CredentialType CredentialType { get; set; }
}

public class SignAssetHandler : IRequestHandler<SignAsset, Result>
{
    readonly IRepository _repository;
    readonly IWorldCoinService _worldCoinService;
    readonly IBus _bus;

    public SignAssetHandler(IRepository repository, IWorldCoinService worldCoinService, IBus bus)
    {
        _repository = repository;
        _worldCoinService = worldCoinService;
        _bus = bus;
    }
    public async Task<Result> Handle(SignAsset request, CancellationToken cancellationToken)
    {
        var asset = _repository.Get<Asset>(request.AssetId, true);
        if (asset is null) return Result.NotFound();

        // verify the signature
        var verified = await _worldCoinService.IsProofValid(
            request.Payload.VerificationLevel,
            request.Payload.Proof,
            request.Payload.MerkleRoot,
            request.Payload.NullifierHash,
            request.Payload.CredentialType,
            asset.Id);

        if (!verified)
            return Result.Invalid();

    
        var updater = _repository.Assets.Updater;
        var update = updater.Combine(
            updater.Set(x => x.Attestation, new Attestation
            {
                VerificationLevel=request.Payload.VerificationLevel,
                Proof= request.Payload.Proof,
                MerkleRoot= request.Payload.MerkleRoot,
                NullifierHash= request.Payload.NullifierHash,
                CredentialType= request.Payload.CredentialType
            }),
            updater.Set(x => x.Status, FileStatus.Ready),
            updater.Set(x => x.UpdatedOn, DateTimeOffset.UtcNow),
            updater.Set(x => x.UpdatedBy, _repository.GetLoggedInUserDto())
        );

        await _repository.Assets.Patch(x => x.Id == asset.Id, update, cancellationToken);

        // publish event
        await _bus.Publish(new AssetSigned(asset.Id), cancellationToken);

        return Result.Success();
    }
}