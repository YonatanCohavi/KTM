using FastEndpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.HttpOverrides;
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
builder.Services.AddSingleton<IXPCalculator, XPCalculator>();
builder.Services.AddScoped<IMemberSessionManager, MemberSessionManager>();
builder.Services.AddScoped<ILeaderboardXpStore, SupabaseLeaderboardXpStore>();
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

// Add security headers
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

var app = builder.Build();

// Handle Azure's X-Forwarded-Proto header for HTTPS detection
if (!app.Environment.IsDevelopment())
{
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedProto
    });
    app.UseHsts();
    // Force HTTPS redirect in production
    app.UseHttpsRedirection();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseHttpsRedirection();
}
else
{
    app.MapOpenApi();
}

app.UseCors();
app.MapHealthChecks("/health");
app.UseResponseCaching();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
});

app.MapFallbackToFile("index.html");

app.Run();
