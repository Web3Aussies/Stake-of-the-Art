namespace StakingArt.Models.Shared;

public abstract class AuditableEntity
{
    public DateTimeOffset CreatedOn { get; set; }
    public UserDto CreatedBy { get; set; }

    public DateTimeOffset? UpdatedOn { get; set; }
    public UserDto UpdatedBy { get; set; }
}