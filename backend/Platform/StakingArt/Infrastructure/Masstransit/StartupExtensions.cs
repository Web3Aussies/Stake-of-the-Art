using MassTransit;
using StakingArt.Consumers.Storage;
using StakingArt.Infrastructure.Storage;

namespace StakingArt.Infrastructure.Masstransit;

public static class StartupExtensions
{
    public interface IAwsBus : IBus
    {

    }

    public static void ConfigureMasstransit(this WebApplicationBuilder builder)
    {
        var options = builder.Configuration.GetSection(RabbitMqOptions.Section).Get<RabbitMqOptions>();
        
        builder.Services.AddMassTransit(cfg =>
        {
            cfg.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter(options.QueueNamePrefix, true));
            cfg.AddConsumers(filter => filter != typeof(FileAddedConsumer),
                typeof(StartupExtensions).Assembly);

            cfg.UsingRabbitMq((context, c) =>
            {
                c.Host(options.Host, options.VirtualHost, h =>
                {
                    h.Username(options.Username);
                    h.Password(options.Password);
                });

                c.PrefetchCount = 1;
                c.ConcurrentMessageLimit = 1;
                c.ConfigureEndpoints(context);
            });
        });

        builder.Services.AddTransient<FileAddedConsumerDefinition>();
        builder.Services.AddMassTransit<IAwsBus>(cfg =>
        {
            cfg.AddConsumer<FileAddedConsumer, FileAddedConsumerDefinition>();
            cfg.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter(options!.QueueNamePrefix, true));
            cfg.UsingAmazonSqs((context, c) =>
            {
                var sOptions = context.GetRequiredService<StorageOptions>();
                c.Host(sOptions.Region, h =>
                {
                    h.AccessKey(sOptions.AccessKey);
                    h.SecretKey(sOptions.SecretKey);
                });

                c.ConfigureEndpoints(context);

                
            });
        });
    }

}
