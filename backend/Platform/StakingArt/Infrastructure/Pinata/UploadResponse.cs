using Refit;

namespace StakingArt.Infrastructure.Pinata;

public class UploadResponse
{
    [AliasAs("IpfsHash")]
    public string IpfsHash { get; set; }

    [AliasAs("PinSize")]
    public int PinSize { get; set; }

    [AliasAs("Timestamp")]
    public string Timestamp { get; set; }

    // Add other properties as needed
}