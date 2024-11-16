using System.Net.Http.Headers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Refit;
using PinataClient = PinataNET.PinataClient;

namespace StakingArt.Infrastructure.Pinata;

public static class StartupExtensions
{
    public static void ConfigurePinata(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetSection(PinataOptions.Section).Get<PinataOptions>();
        if (options == null)
            throw new ArgumentNullException(nameof(options));

        builder.Services.AddSingleton(options);

        var refitSettings = new RefitSettings
        {
            ContentSerializer = new NewtonsoftJsonContentSerializer(new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore,
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                Converters = { new StringEnumConverter() }
            }),
        };
        builder.Services.AddRefitClient<PinataUploadClient>(refitSettings)
            .ConfigureHttpClient(opt =>
        {
            opt.BaseAddress = new Uri(options.UploadUrl);
            opt.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.JWT);

        }).AddHttpMessageHandler<DebugHandler>();

        builder.Services.AddRefitClient<PinataFileClient>(refitSettings)
            .ConfigureHttpClient(opt =>
            {
                opt.BaseAddress = new Uri(options.BaseUrl);
                opt.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.JWT);

            });

        builder.Services.AddScoped(_ => new PinataClient(options.JWT));

        builder.Services.AddScoped<DebugHandler>();

        //builder.Services.AddScoped( new global::Pinata.Client.PinataClient(new Config()
        //{
        //    ApiKey = 
        //}))
    }
}

public class DebugHandler : DelegatingHandler
{
    readonly PinataOptions _options;

    public DebugHandler(PinataOptions options)
    {
        _options = options;
    }
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        request.Content?.Headers.Add("Authorization", $"Bearer {_options.JWT}");

        var r = await base.SendAsync(request, cancellationToken);
        return r;
    }
}
