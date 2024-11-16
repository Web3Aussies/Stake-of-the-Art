namespace StakingArt.Infrastructure.Pinata;

public class PinataOptions
{
    public static string Section = "Pinata";

    public string BaseUrl { get; set; }
    public string UploadUrl { get; set; }
    public string JWT { get; set; }
    
}
