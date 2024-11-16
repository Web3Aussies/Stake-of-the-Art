using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace StakingArt.Models;

public class Category
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Name { get; set; }

    public CategoryType Type { get; set; }

    public ICollection<string> Assets { get; set; } = new List<string>(); // list of all assets
}

public enum CategoryType
{
    Category,
    Color
}

