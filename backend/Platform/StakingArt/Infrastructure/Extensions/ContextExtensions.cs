using System.Security.Claims;

namespace StakingArt.Infrastructure.Extensions;

public static class ContextExtensions
{
    public static string? GetUserId(this IHttpContextAccessor contextAccessor)
    {
        return contextAccessor.HttpContext?.User?.FindFirstValue(Constants.USER_ID_CLAIM_TYPE);
    }
}