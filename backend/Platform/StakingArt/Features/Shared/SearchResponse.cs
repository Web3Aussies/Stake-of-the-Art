namespace StakingArt.Features.Shared;

public class SearchResponse<TResult>
{
    public ICollection<TResult> Results { get; set; }

    public long TotalRecords { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
}
