namespace StakingArt.Infrastructure.OpenAI;

public class OpenAIOptions
{
    public static string Section = "OpenAI";

    public string Model { get; set; }
    public string ApiKey { get; set; }
}
