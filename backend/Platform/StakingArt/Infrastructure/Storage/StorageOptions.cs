namespace StakingArt.Infrastructure.Storage;

public class StorageOptions
{
    public static string Section = "AWS";

    public string AccessKey { get; set; }
    public string SecretKey { get; set; }
    public string Region { get; set; }
    public string BucketName { get; set; }
    public string BucketEdgeUrl { get; set; }
    public int UploadLinkExpiryHours { get; set; }
    public int DownloadLinkExpiryHours { get; set; }
    public string ImageSigningSecretId { get; set; }
}