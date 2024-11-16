using OpenAI.Chat;

namespace StakingArt.Infrastructure.OpenAI;

public static class StartupExtensions
{
    public static void ConfigureOpenAI(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetSection(OpenAIOptions.Section).Get<OpenAIOptions>();
        if (options == null)
            throw new ArgumentNullException(nameof(options));

        builder.Services.AddSingleton(options);

        builder.Services.AddSingleton(new ChatClient(options.Model, apiKey: options.ApiKey));
    }
}
