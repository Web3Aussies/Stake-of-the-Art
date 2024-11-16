using System.Security.Claims;
using Auth0.AuthenticationApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Nethereum.Hex.HexConvertors.Extensions;
using StakingArt.Models;
using StakingArt.Services;

namespace StakingArt.Infrastructure.Security;

public static class StartupExtensions
{
    public static void ConfigureAuthentication(this WebApplicationBuilder builder)
    {
        var auth0Options = builder.Configuration.GetSection(Auth0Options.Section).Get<Auth0Options>();
        if (auth0Options is null)
            throw new Exception("Missing auth0 configurations!");

        var appOptions = builder.Configuration.GetSection(SecurityOptions.Section).Get<SecurityOptions>();
        if (appOptions is null)
            throw new Exception("Missing app security configurations!");

        builder.Services.AddSingleton(auth0Options);
        builder.Services.AddSingleton(appOptions);

        JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();
        builder.Services
            .AddAuthentication()
            .AddJwtBearer(Constants.PARTNER_SCHEME, opt =>
            {
                opt.Authority = $"https://{auth0Options.Domain}/";
                opt.Audience = auth0Options.Audience;

                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = ClaimTypes.NameIdentifier
                };

                opt.Events = new()
                {
                    OnTokenValidated = async context =>
                    {
                        await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();

                        var userService = scope.ServiceProvider.GetRequiredService<IUserService>();
                        var repository = scope.ServiceProvider.GetRequiredService<IRepository>();

                        var sub = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);

                        if (string.IsNullOrWhiteSpace(sub))
                        {
                            // no user id in token, this should not happen!
                            context.Fail("invalid user!");
                            return;
                        }

                        var user = await repository.Users.Find(x => x.IdentityId, sub, CancellationToken.None);
                        if (user is null)
                        {
                            // this is a partner, only partners login via auth0
                            user = await userService.EnrollUser(sub, UserRole.Partner);
                        }

                        var claims = new List<Claim>
                        {
                            new(Constants.USER_ID_CLAIM_TYPE, user.Id),
                        };

                        if (context.Principal?.Identity is not ClaimsIdentity identity) return;

                        foreach (var claim in claims.Where(x => !identity.HasClaim(x.Type, x.Value)).ToList())
                        {
                            identity.AddClaim(claim);
                        }
                    }

                };
            })
            .AddJwtBearer(Constants.APP_SCHEME, opt =>
            {
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    ValidIssuer = appOptions.Issuer,
                    ValidAudience = appOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(appOptions.SecretKey.HexToByteArray())
                };

                opt.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();

                        var repository = scope.ServiceProvider.GetRequiredService<IRepository>();

                        var sub = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);

                        if (string.IsNullOrWhiteSpace(sub))
                        {
                            // no user id in token, this should not happen!
                            context.Fail("invalid user!");
                            return;
                        }

                        var user = await repository.Users.Find(x => x.Id, sub, CancellationToken.None);
                        if (user is null)
                        {
                            // this is a partner, only partners login via auth0
                            context.Fail("invalid user!");
                            return;
                        }
                        
                        var claims = new List<Claim>
                        {
                            new(Constants.USER_ID_CLAIM_TYPE, user.Id),
                        };

                        if (context.Principal?.Identity is not ClaimsIdentity identity) return;

                        foreach (var claim in claims.Where(x => !identity.HasClaim(x.Type, x.Value)).ToList())
                        {
                            identity.AddClaim(claim);
                        }
                    }
                };
            });
    }

    public static void ConfigureAuth0(this WebApplicationBuilder builder)
    {
        var auth0Options = builder.Configuration.GetSection(Auth0Options.Section).Get<Auth0Options>();
        if (auth0Options is null) throw new Exception("Missing auth0 configurations!");
        builder.Services.AddSingleton(auth0Options);

        builder.Services.AddSingleton<IAuthenticationApiClient>(_ => new AuthenticationApiClient(new Uri($"https://{auth0Options.Domain}/")));

        builder.Services.AddScoped<ManagementClientFactory>();
    }


}