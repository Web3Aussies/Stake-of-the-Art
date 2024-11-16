using Amazon;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.SecretsManager;

namespace StakingArt.Infrastructure.Storage;

public static class StartupExtensions
{
    public static void ConfigureAmazonS3(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetSection(StorageOptions.Section).Get<StorageOptions>();
        if (options == null)
            throw new ArgumentNullException(nameof(options));

        builder.Services.AddSingleton(options);

        builder.Services.AddDefaultAWSOptions(new AWSOptions
        {
            Region = RegionEndpoint.GetBySystemName(options.Region),
            Credentials = new BasicAWSCredentials(options.AccessKey, options.SecretKey)
        });
        builder.Services.AddAWSService<IAmazonS3>();
        builder.Services.AddAWSService<IAmazonSecretsManager>();

    }
}
