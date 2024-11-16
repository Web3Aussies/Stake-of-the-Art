using Newtonsoft.Json;
using Refit;

namespace StakingArt.Infrastructure.Pinata;

public class UpdateFileMetadataRequest
{
    [JsonProperty("ipfsPinHash", Required = Required.Always)]
    public string ipfsPinHash { get; set; }
    [JsonProperty("name", Required = Required.Always)]
    public string Name { get; set; }
    [JsonProperty("keyvalues", Required = Required.AllowNull)]
    public Dictionary<string, string> KeyValues { get; set; }

}

public interface PinataFileClient
{
    [Put("/pinning/hashMetadata")]
    Task UpdateFileMetadata([Body] UpdateFileMetadataRequest request);
}
