using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;
using Webapi.Featrues.Knesset.Dto;

namespace Webapi.Featrues.Knesset;

public interface IKnessetAPI
{
    Task<Faction[]> GetFactionsAsync(CancellationToken cancellationToken);
    Task<KnessentMember[]> GetKnessetMembersAsync(CancellationToken cancellationToken);
    Task<Stream> GetMemberImageAsync(int memberId, CancellationToken ct);
    Task<bool> HealthCheckAsync(CancellationToken cancellationToken);
}

public class FarctionResponse
{
    [JsonPropertyName("factionlist")]
    public Faction[] FactionList { get; set; } = [];
}

public class MembersResponse
{
    [JsonPropertyName("mks")]
    public KnessentMember[] Members { get; set; } = [];
}

public class KnessetAPI(HttpClient httpClient, IMemoryCache memoryCache) : IKnessetAPI
{
    public async Task<Faction[]> GetFactionsAsync(CancellationToken cancellationToken)
    {
        var response = await httpClient.GetFromJsonAsync<FarctionResponse>("Faction/GetFactions?lng=he",cancellationToken);
        return response?.FactionList ?? [];
    }

    public async Task<KnessentMember[]> GetKnessetMembersAsync(CancellationToken cancellationToken)
    {
        return await memoryCache.GetOrCreateAsync("members", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            var response = await httpClient.GetFromJsonAsync<MembersResponse>("MkLobby/GetMkLobbyData120?lang=he", cancellationToken);
            return response?.Members ?? [];
        }) ?? [];
    }

    public async Task<Stream> GetMemberImageAsync(int memberId, CancellationToken ct)
    {
        var members = await GetKnessetMembersAsync(ct);
        var member = members.FirstOrDefault(m => m.MkId == memberId);
        if (member == null || string.IsNullOrEmpty(member.ImagePath))
            throw new ArgumentException($"Member with ID {memberId} not found or has no image.");

        using var proxyClient = new HttpClient();
        return await proxyClient.GetStreamAsync(member.ImagePath, ct);
    }

    public async Task<bool> HealthCheckAsync(CancellationToken cancellationToken)
    {
        try
        {
            await httpClient.GetAsync("/GlobalResources/GetResourceValues?LanguageId=1&Keys=knsgroup_accessibility", cancellationToken);
            return true;
        }
        catch (Exception)
        {

            return false;
        }
    }
}
