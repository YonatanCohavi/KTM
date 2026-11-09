using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.DB.Supabase;

namespace Webapi.Featrues.Questions;

public interface IBrowserWeightCache
{
    Task ResetWeightsAsync(string browserId, CancellationToken ct = default);
    Task<MemberWeight[]> GetWeightsAsync(string browserId, CancellationToken ct = default);
    void SetWeights(string browserId, Dictionary<int, double> weights);
    Task AdjustWeightAsync(string browserUuid, int memberId, bool known);
}

public class SupabaseBrowserWeightCache(IMemoryCache cache, Supabase.Client supabase) : IBrowserWeightCache
{
    private const string CacheKeyPrefix = "browser_weights_";
    private const int CacheDurationHours = 24;
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> BrowserLocks = new();

    public async Task<MemberWeight[]> GetWeightsAsync(string browserId, CancellationToken ct = default)
    {
        var browserLock = BrowserLocks.GetOrAdd(browserId, _ => new SemaphoreSlim(1, 1));

        await browserLock.WaitAsync(ct);
        try
        {
            var weights = await supabase
                .From<BrowserWeight>()
                .Where(bw => bw.BrowserUuid == browserId)
                .Get();

            if (weights.Model is null)
            {
                await supabase
                    .From<BrowserWeight>()
                    .Insert(new BrowserWeight
                    {
                        BrowserUuid = browserId,
                        MemberWeights = []
                    }, cancellationToken: ct);

                return [];
            }

            return weights.Model.MemberWeights ?? [];
        }
        finally
        {
            browserLock.Release();
        }
    }

    public async Task AdjustWeightAsync(string browserUuid, int memberId, bool increase)
    {
        var multiplier = increase ? 1.05 : 0.95;

        var parameters = new Dictionary<string, object>
        {
            { "p_browser_uuid", browserUuid },
            { "p_member_id", memberId },
            { "p_multiplier", multiplier }
        };

        await supabase.Rpc("adjust_member_weight", parameters);
    }
    public void SetWeights(string browserId, Dictionary<int, double> weights)
    {
        var cacheKey = GetCacheKey(browserId);
        var cacheEntryOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(CacheDurationHours),
            SlidingExpiration = TimeSpan.FromHours(1)
        };

        cache.Set(cacheKey, weights, cacheEntryOptions);
    }

    private static string GetCacheKey(string browserId) => $"{CacheKeyPrefix}{browserId}";

    public async Task ResetWeightsAsync(string browserId, CancellationToken ct = default)
    {
        await supabase
              .From<BrowserWeight>()
              .Where(bw => bw.BrowserUuid == browserId)
              .Delete(cancellationToken: ct);
    }
}
