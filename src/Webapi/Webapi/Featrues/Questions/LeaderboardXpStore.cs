using System.Collections.Concurrent;
using Webapi.Featrues.DB.Supabase;

namespace Webapi.Featrues.Questions;

public interface ILeaderboardXpStore
{
    Task<int> UpdateXpAsync(string browserUuid, int xpToAdd, CancellationToken ct = default);
}

public class SupabaseLeaderboardXpStore(Supabase.Client supabase, IXPCalculator xpCalculator) : ILeaderboardXpStore
{
    private static readonly ConcurrentDictionary<string, int> estimatedXpByBrowser = new();
    private static readonly ConcurrentDictionary<string, int> pendingXpDeltas = new();
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> flushLocks = new();

    public async Task<int> UpdateXpAsync(string browserUuid, int xpToAdd, CancellationToken ct = default)
    {
        var estimatedXp = estimatedXpByBrowser.AddOrUpdate(
            browserUuid,
            _ => ApplyDelta(0, xpToAdd),
            (_, currentXp) => ApplyDelta(currentXp, xpToAdd));

        pendingXpDeltas.AddOrUpdate(browserUuid, xpToAdd, (_, currentDelta) => currentDelta + xpToAdd);
        QueueFlush(browserUuid);

        await Task.CompletedTask;
        return estimatedXp;
    }

    private int ApplyDelta(int currentXp, int xpDelta)
    {
        var level = xpCalculator.GetLevelByXp(currentXp);
        return Math.Max(level.CurrentLevelXp, currentXp + xpDelta);
    }

    private void QueueFlush(string browserUuid)
    {
        var flushLock = flushLocks.GetOrAdd(browserUuid, _ => new SemaphoreSlim(1, 1));
        if (!flushLock.Wait(0))
            return;

        _ = Task.Run(async () =>
        {
            try
            {
                await FlushPendingDeltasAsync(browserUuid);
            }
            finally
            {
                flushLock.Release();
            }
        });
    }

    private async Task FlushPendingDeltasAsync(string browserUuid)
    {
        while (pendingXpDeltas.TryRemove(browserUuid, out var xpDelta))
        {
            try
            {
                await PersistDeltaAsync(browserUuid, xpDelta);
            }
            catch
            {
                pendingXpDeltas.AddOrUpdate(browserUuid, xpDelta, (_, existing) => existing + xpDelta);
                break;
            }
        }
    }

    private async Task PersistDeltaAsync(string browserUuid, int xpDelta)
    {
        var leaderboard = await supabase
            .From<LeaderboardEntry>()
            .Where(x => x.BrowserUuid == browserUuid)
            .Get(cancellationToken: CancellationToken.None);

        if (leaderboard.Model is null)
        {
            if (xpDelta <= 0)
            {
                estimatedXpByBrowser.TryAdd(browserUuid, 0);
                return;
            }

            await supabase
                .From<LeaderboardEntry>()
                .Insert(new LeaderboardEntry
                {
                    BrowserUuid = browserUuid,
                    Xp = xpDelta,
                    UpdatedAt = DateTime.UtcNow
                }, cancellationToken: CancellationToken.None);

            estimatedXpByBrowser.AddOrUpdate(browserUuid, xpDelta, (_, _) => xpDelta);
            return;
        }

        var persistedXp = ApplyDelta(leaderboard.Model.Xp, xpDelta);
        leaderboard.Model.Xp = persistedXp;
        leaderboard.Model.UpdatedAt = DateTime.UtcNow;

        await leaderboard.Model.Update<LeaderboardEntry>(cancellationToken: CancellationToken.None);
        estimatedXpByBrowser.AddOrUpdate(browserUuid, persistedXp, (_, _) => persistedXp);
    }
}
