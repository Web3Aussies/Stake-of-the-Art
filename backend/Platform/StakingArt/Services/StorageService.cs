using Amazon.S3;
using Amazon.S3.Model;
using StakingArt.Infrastructure.Storage;

namespace StakingArt.Services;

public interface IStorageService
{
    Task<string> Upload(
        string tenant,
        Stream fileStream,
        string fileName,
        CancellationToken cancellationToken = default);

    Task<string> Upload(
        string tenant,
        byte[] fileBytes,
        string fileName,
        CancellationToken cancellationToken = default);

    Task UpdateAccessPermission(string assetKey, bool isPublic, CancellationToken cancellationToken = default);
    Task Delete(string assetKey, CancellationToken cancellationToken = default);

    Task<Stream> Download(string assetKey, CancellationToken cancellationToken = default);

    Task<string> GetUploadSignedUrl(string key, string contentType, Dictionary<string, string> meta);
    Task<string> GetDownloadSignedUrl(string key);
}

public class S3StorageService : IStorageService
{
    readonly IAmazonS3 _client;
    readonly StorageOptions _options;
    readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IAmazonS3 client, StorageOptions options, ILogger<S3StorageService> logger)
    {
        _client = client;
        _options = options;
        _logger = logger;
    }


    public async Task<string> Upload(string tenant,Stream fileStream, string fileName,
        CancellationToken cancellationToken = default)
    {
        var isPublic = false;

        // cleanup filename
        fileName = CleanupFilename(fileName);
        var tenantKey = CleanupFilename(tenant);

        // this will be returned once the file is successfully uploaded
        var assetKey = GenerateAssetKey(tenantKey, fileName);

        // test if the filename exists already
        var counter = 0;
        while (true)
        {
            try
            {
                var metaData = await _client.GetObjectMetadataAsync(_options.BucketName, assetKey, cancellationToken);
                if (metaData == null) break;
            }
            catch (Exception e)
            {
                break;
            }

            counter++;
            assetKey = GenerateAssetKey(tenantKey, fileName, counter);
        }

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = assetKey,
            InputStream = fileStream,
            CannedACL = new S3CannedACL(isPublic ? "public-read" : "private"),

        };

        var response = await _client.PutObjectAsync(request, cancellationToken);

        return assetKey;
    }

    public async Task<string> Upload(string tenant, byte[] fileBytes, string fileName,
        CancellationToken cancellationToken = default)
    {
        await using var stream = new MemoryStream(fileBytes);
        return await Upload(tenant, stream, fileName, cancellationToken);
    }

    public async Task UpdateAccessPermission(string assetKey, bool isPublic, CancellationToken cancellationToken = default)
    {
        await _client.PutACLAsync(new PutACLRequest
        {
            BucketName = _options.BucketName,
            Key = assetKey,
            CannedACL = new S3CannedACL(isPublic ? "public-read" : "private")
        }, cancellationToken);
    }

    public async Task Delete(string assetKey, CancellationToken cancellationToken = default)
    {
        try
        {
            await _client.DeleteObjectAsync(_options.BucketName, assetKey, cancellationToken);
        }
        catch (Exception e)
        {
            _logger.LogError(e, $"Unable to delete file key: {assetKey}");
        }

    }

    public async Task<Stream> Download(string assetKey, CancellationToken cancellationToken = default)
    {
        var fileStream = new MemoryStream();
        using var response = await _client.GetObjectAsync(new GetObjectRequest
        {
            BucketName = _options.BucketName,
            Key = assetKey
        }, cancellationToken);

        await using (var stream = response.ResponseStream)
            await response.ResponseStream.CopyToAsync(fileStream, cancellationToken);


        fileStream.Seek(0, SeekOrigin.Begin);

        return fileStream;
    }

    public async Task<string> GetUploadSignedUrl(string key, string contentType, Dictionary<string, string> meta)
    {
        var request = new GetPreSignedUrlRequest()
        {
            Key = key,
            //ContentType = contentType,
            Expires = DateTime.UtcNow.AddHours(_options.UploadLinkExpiryHours),
            BucketName = _options.BucketName,
            Verb = HttpVerb.PUT,
        };

        //foreach (var k in meta) request.Metadata.Add(k.Key, k.Value);

        return await _client.GetPreSignedURLAsync(request);
    }

    public async Task<string> GetDownloadSignedUrl(string key)
    {
        return await _client.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            Verb = HttpVerb.GET,
            Key = key,
            Expires = DateTime.UtcNow.AddHours(_options.DownloadLinkExpiryHours),
            BucketName = _options.BucketName,
        });
    }


    string GenerateAssetKey(string tenantKey, string fileName, int increment = 0)
    {
        var fileName_ = increment <= 0
            ? Path.GetFileName(fileName)
            : $"{Path.GetFileNameWithoutExtension(fileName)}_{increment}{Path.GetExtension(fileName)}";

        return string.IsNullOrWhiteSpace(tenantKey)
            ? $"system/{fileName_}".ToLower()
            : $"{tenantKey}/{fileName_}".ToLower();
    }
    string CleanupFilename(string fileName)
    {
        // remove illegal characters
        // make file lower case
        var legalChars = "!-_.*'()".ToCharArray();

        return string.Join("",
            fileName
                .Trim()
                .ToLower()
                .ToCharArray()
                .Where(f => char.IsLetterOrDigit(f) || legalChars.Contains(f))
                .ToArray());
    }
}