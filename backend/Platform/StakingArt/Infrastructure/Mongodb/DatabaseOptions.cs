namespace StakingArt.Infrastructure.Mongodb
{
    public class DatabaseOptions
    {
        public static string Section = "MongoDb";
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }

    }
}
