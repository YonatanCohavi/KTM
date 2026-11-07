using FastEndpoints;
using Microsoft.AspNetCore.Authentication;
using Supabase.Core.Http;
using Supabase.Extensions.DependencyInjection;
using Webapi.Featrues.Auth;
using Webapi.Featrues.Knesset;
using Webapi.Featrues.Members;
using Webapi.Featrues.Questions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient<IKnessetAPI, KnessetAPI>(client =>
{
    client.BaseAddress = new Uri("https://knesset.gov.il/WebSiteApi/knessetapi/");
});

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IBrowserWeightCache, SupabaseBrowserWeightCache>();
builder.Services.AddScoped<IMemberSessionManager, MemberSessionManager>();
builder.Services.AddSupabase(
    supabaseUrl: builder.Configuration["Supabase:Url"]!,
    supabaseKey: builder.Configuration["Supabase:Key"]!,
    configureOptions: options =>
    {
        options.AutoConnectRealtime = true;
        options.AutoRefreshToken = true;
        options.PostgrestRetry = new RetryOptions { MaxRetries = 3 };
    });
builder.Services.AddHealthChecks()
    .AddCheck<KnessetapiHealth>("KnessetAPI");
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
      {
          builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
      });
});
builder.Services
    .AddResponseCaching()
    .AddFastEndpoints()
    .AddAuthorization()
    .AddAuthentication(ApiKeyAuthHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthHandler>(ApiKeyAuthHandler.SchemeName, null);
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors();
app.UseHttpsRedirection();
app.MapHealthChecks("/health");
app.UseResponseCaching();
app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
});

app.Run();
