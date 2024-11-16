using Ardalis.Result.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Converters;
using Serilog;
using StakingArt.Infrastructure.Mongodb;
using StakingArt.Infrastructure.Security;
using StakingArt.Infrastructure.Storage;
using StakingArt.Infrastructure.Swagger;
using StakingArt.Infrastructure.WorldCoin;
using StakingArt.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddUserSecrets<Program>(optional: true);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

builder.Services.AddControllers(opt =>
    {
        opt.AddDefaultResultConvention();
    })
    .AddNewtonsoftJson(opt =>
{
    opt.SerializerSettings.Converters.Add(new StringEnumConverter());
});

builder.Services.AddCors(opt => opt.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod()));

builder.Services.Configure<ApiBehaviorOptions>(opt => opt.SuppressInferBindingSourcesForParameters = true);

builder.Services.AddResponseCompression(options => { options.EnableForHttps = true; });
builder.Services.AddRouting(options => { options.LowercaseUrls = true; });
builder.Services.AddHttpContextAccessor();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.ConfigureSwagger();

builder.Services.AddLazyCache();

// mediator 
builder.Services.AddMediatR(opt => opt.RegisterServicesFromAssemblyContaining<Program>());

// mongodb
builder.ConfigureMangoDb();

//authentication
builder.ConfigureAuthentication();
builder.ConfigureAuth0();

// configure amazon
builder.ConfigureAmazonS3();

//world coin
builder.ConfigureWorldCoin();



// services
builder.Services.AddScoped<IRepository, Repository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IStorageService, S3StorageService>();
builder.Services.AddSingleton<ImageService>();
builder.Services.AddScoped<IWorldCoinService, WorldCoinService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(opt =>
    {
        opt.OAuthClientId(builder.Configuration["Swagger:OAuthClientId"]);
        opt.OAuthUsePkce();
    });
}

app.UseCors();
app.UseHttpsRedirection();
app.UseSerilogRequestLogging();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
