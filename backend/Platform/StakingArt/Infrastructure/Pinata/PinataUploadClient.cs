using Refit;

namespace StakingArt.Infrastructure.Pinata;

public interface PinataUploadClient
{
    
    [Multipart()]
    [Post("/v3/files")]
    public Task<UploadResponse> UploadFile([AliasAs("file")] StreamPart file);
}
