using FastEndpoints;
using Microsoft.AspNetCore.Authentication;
using Webapi.Featrues.Auth;
using Webapi.Featrues.Knesset;
using Webapi.Featrues.Questions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddHttpClient<IKnessetAPI, KnessetAPI>(client =>
{
    client.BaseAddress = new Uri("https://knesset.gov.il/WebSiteApi/knessetapi/");
});

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IBrowserWeightCache, BrowserWeightCache>();
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
