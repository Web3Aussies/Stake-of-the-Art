using StakingArt.Models;

namespace StakingArt.Features.App.Assets.Shared;

public class AssetResponse
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Filename { get; set; }
    public string ImageUrl { get; set; }
    public string? Category { get; set; }

    public AssetResponse(Asset model)
    {
        Id = model.Id;

        Title = model.Title;
        Filename = model.Filename;

        Category = model.Categories?.FirstOrDefault()?.Name;
    }
}
