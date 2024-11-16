namespace StakingArt.Infrastructure.Security;

public class SecurityOptions
{
    public static string Section = "Security";
    public string SecretKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int Expires { get; set; }        // expires in seconds
}