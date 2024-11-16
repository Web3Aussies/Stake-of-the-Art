using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace StakingArt.Infrastructure.Mongodb
{
    public static class StartupExtensions
    {
        public static void ConfigureMangoDb(this WebApplicationBuilder builder)
        {
            var dbOptions = builder.Configuration.GetSection(DatabaseOptions.Section).Get<DatabaseOptions>();
            if (dbOptions is null) throw new Exception("Database configuration is missing!");

            builder.Services.AddSingleton(dbOptions);

            var pack = new ConventionPack
            {
                new EnumRepresentationConvention(BsonType.String),
                new CamelCaseElementNameConvention(),
                new IgnoreExtraElementsConvention(true)
            };
            ConventionRegistry.Register("Conventions", pack, t => true);

            BsonSerializer.RegisterSerializer(typeof(Guid), new GuidSerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(typeof(Guid?), new NullableSerializer<Guid>(new GuidSerializer(BsonType.String)));
            BsonSerializer.RegisterSerializer(typeof(decimal), new DecimalSerializer(BsonType.Decimal128));
            BsonSerializer.RegisterSerializer(typeof(decimal?), new NullableSerializer<decimal>(new DecimalSerializer(BsonType.Decimal128)));
            BsonSerializer.RegisterSerializer(typeof(DateTimeOffset), new DateTimeOffsetSerializer(BsonType.DateTime));
            BsonSerializer.RegisterSerializer(typeof(DateTimeOffset?), new NullableSerializer<DateTimeOffset>(new DateTimeOffsetSerializer(BsonType.DateTime)));

            builder.Services.AddScoped<IMongoClient>(_ =>
            {
                var client = new MongoClient(dbOptions.ConnectionString);
                return client;
            });
        }
    }
}
