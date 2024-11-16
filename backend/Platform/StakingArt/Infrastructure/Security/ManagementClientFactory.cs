using Auth0.AuthenticationApi;
using Auth0.AuthenticationApi.Models;
using Auth0.ManagementApi;
using LazyCache;

namespace StakingArt.Infrastructure.Security;

public class ManagementClientFactory
{
    readonly IAuthenticationApiClient _authClient;
    readonly IAppCache _cache;
    readonly Auth0Options _options;

    public ManagementClientFactory(IAuthenticationApiClient authClient, IAppCache cache, Auth0Options options)
    {
        _authClient = authClient;
        _cache = cache;
        _options = options;
    }
    public async Task<IManagementApiClient> GetClient()
    {
        const string CACHE_KEY = "AUTH0_APP_TOKEN";

        var token = _cache.Get<string>(CACHE_KEY);

        // if we have the token in cache, return
        if (!string.IsNullOrWhiteSpace(token)) return new ManagementApiClient(token, _options.Domain);

        try
        {
            var tokenResponse = await _authClient.GetTokenAsync(new ClientCredentialsTokenRequest
            {
                ClientId = _options.ClientId,
                ClientSecret = _options.ClientSecret,
                Audience = $"https://{_options.Domain}/api/v2/"
            });

            // add access token to cache and expire it 30sec before its expiry
            _cache.Add(CACHE_KEY, tokenResponse.AccessToken, DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 30));

            token = tokenResponse.AccessToken;
        }
        catch (Exception e)
        {
            throw;
        }

        return new ManagementApiClient(token, _options.Domain);
    }
}
