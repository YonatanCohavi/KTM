using Microsoft.Extensions.Caching.Memory;

namespace Webapi.Featrues.Questions;

/// <summary>
/// Stores member weights per browser UUID to avoid sending weights on every request.
/// Weights are cached in memory with a 24-hour expiration.
/// </summary>
public interface IBrowserWeightCache
{
    /// <summary>
    /// Get cached weights for a browser UUID.
    /// Returns null if not cached (client should send weights).
    /// </summary>
    Dictionary<int, double>? GetWeights(string browserId);
    
    /// <summary>
    /// Cache weights for a browser UUID.
    /// </summary>
    void SetWeights(string browserId, Dictionary<int, double> weights);
}

public class BrowserWeightCache : IBrowserWeightCache
{
    private readonly IMemoryCache _cache;
    private const string CacheKeyPrefix = "browser_weights_";
    private const int CacheDurationHours = 24;

    public BrowserWeightCache(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Dictionary<int, double>? GetWeights(string browserId)
    {
        var cacheKey = GetCacheKey(browserId);
        return _cache.TryGetValue(cacheKey, out Dictionary<int, double>? weights) ? weights : null;
    }

    public void SetWeights(string browserId, Dictionary<int, double> weights)
    {
        var cacheKey = GetCacheKey(browserId);
        var cacheEntryOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(CacheDurationHours),
            SlidingExpiration = TimeSpan.FromHours(1)
        };
        
        _cache.Set(cacheKey, weights, cacheEntryOptions);
    }

    private static string GetCacheKey(string browserId) => $"{CacheKeyPrefix}{browserId}";
}
