using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Encodings.Web;

namespace Webapi.Featrues.Auth;

public sealed class ApiKeyAuthHandler(
                        IOptionsMonitor<AuthenticationSchemeOptions> options,
                        ILoggerFactory logger,
                        UrlEncoder encoder) 
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    private const string ApiKeyHeaderName = "x-api-key";
    private const string ApiKey = "_ZwKdbiXzyb70Rpq9tC7d6lJXSofyzUO3";
    public const string SchemeName = "ApiKey";
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        Request.Headers.TryGetValue(ApiKeyHeaderName, out var extractedApiKey);
        if (!IsPublicEndpoint() && !extractedApiKey.Equals(ApiKey))
            return Task.FromResult(AuthenticateResult.Fail("Invalid API credentials!"));

        var identity = new ClaimsIdentity(
           claims: [new Claim("ClientID", "Default")],
           authenticationType: Scheme.Name);
        var principal = new GenericPrincipal(identity, roles: null);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    bool IsPublicEndpoint()
       => Context.GetEndpoint()?.Metadata.OfType<AllowAnonymousAttribute>().Any() is null or true;
}
