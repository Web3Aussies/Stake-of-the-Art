namespace StakingArt.Infrastructure.Masstransit;

public class RabbitMqOptions
{
    public static string Section = "RabbitMq";

    public string QueueNamePrefix { get; set; }
    public string Host { get; set; }
    public string VirtualHost { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
}