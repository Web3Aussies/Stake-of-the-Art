using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Refit;

namespace StakingArt.Infrastructure.WorldCoin;

public static class StartupExtensions
{
    public static void ConfigureWorldCoin(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetSection(WorldCoinOptions.Section).Get<WorldCoinOptions>();
        if (options == null)
            throw new ArgumentNullException(nameof(options));

        builder.Services.AddSingleton(options);
        builder.Services.AddTransient<HashUtil>();

        builder.Services.AddRefitClient<WorldCoinClient>(new RefitSettings
        {
            ContentSerializer = new NewtonsoftJsonContentSerializer(new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Converters = { new StringEnumConverter() }
            }),
        }).ConfigureHttpClient(opt =>
        {
            opt.BaseAddress = new Uri(options.BaseUrl);

            // this is important! WorldCoin server will reject the call if no agent is specified
            opt.DefaultRequestHeaders.Add("User-Agent", "StakingArt");

        })
        .AddDefaultLogger();
    }
}


