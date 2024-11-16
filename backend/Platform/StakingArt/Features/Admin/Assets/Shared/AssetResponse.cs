using StakingArt.Models;

namespace StakingArt.Features.Admin.Assets.Shared;

public class AssetResponse
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Filename { get; set; }
    public FileStatus Status { get; set; }
    public string ImageUrl { get; set; }
    public int Downloads { get; set; }

    public AssetResponse(Asset model)
    {
        Id = model.Id;

        Title = model.Title;
        Filename = model.Filename;
        Status = model.Status;
        Downloads = model.TotalDownloadCount;
    }
}
