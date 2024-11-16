using StakingArt.Models;

namespace StakingArt.Features.Admin.Accounts.Shared;

public class MeResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public DateTimeOffset? AcceptedOn { get; set; }

    public MeResponse(User user)
    {
        Id = user.Id;
        Name = user.Name;
        Email = user.Email;
        AcceptedOn = user.Verifications.AcceptedTermsOn;
    }
}
