using System.Security.Cryptography;
using System.Text;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using LazyCache;
using Newtonsoft.Json;
using StakingArt.Infrastructure.Storage;

namespace StakingArt.Services;

public class ImageService
{
    readonly IAmazonSecretsManager _secretsManager;
    readonly IAppCache _appCache;
    readonly StorageOptions _storageOptions;

    public ImageService(IAmazonSecretsManager secretsManager, IAppCache appCache, StorageOptions storageOptions)
    {
        _secretsManager = secretsManager;
        _appCache = appCache;
        _storageOptions = storageOptions;
    }


    public async Task<string> GetEncodedSignedImageUrl(string objectKey, int width, int height)
    {
        var reqString = JsonConvert.SerializeObject(new
        {
            key = objectKey,
            edits = new
            {
                resize = new
                {
                    width = width,
                    height = height,
                    fit = "inside"
                },
                contentModeration = new
                {
                    minConfidence = 90,
                    blur = 80
                }
            }
        });

        var imageEncoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(reqString));
        var stringToSign = $"/{imageEncoded}";

        var secret = await ExtractSecret();
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));

        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(stringToSign));
        var signature = Convert.ToHexString(signatureBytes);

        // URL Encode the signature
        signature = Uri.EscapeDataString(signature).ToLower();

        // Append signature and expiry to the URL
        return $"/{imageEncoded}?signature={signature}";
    }

    async Task<string> ExtractSecret()
    {
        const string IMAGE_URL_SIGNING_KEY = "IMAGE_URL_SIGNING_KEY";

        return await _appCache.GetOrAddAsync(IMAGE_URL_SIGNING_KEY, async () =>
        {
            var secretValue = await _secretsManager.GetSecretValueAsync(new GetSecretValueRequest
            {
                SecretId = _storageOptions.ImageSigningSecretId
            });


            if (secretValue.SecretString != null)
            {
                // Assuming the secret is stored as JSON {"IMAGE_URL_SIGNING_KEY": "your-secret-key"}
                var secretJson = System.Text.Json.JsonDocument.Parse(secretValue.SecretString);
                return secretJson.RootElement.GetProperty(IMAGE_URL_SIGNING_KEY).GetString() ?? string.Empty;
            }

            throw new Exception("Secret is empty or missing!");

        }, DateTimeOffset.UtcNow.AddDays(1));


    }
}
