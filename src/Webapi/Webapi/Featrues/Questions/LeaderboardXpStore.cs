using Webapi.Featrues.DB.Supabase;

namespace Webapi.Featrues.Questions;

public interface ILeaderboardXpStore
{
    Task<int> UpdateXpAsync(string browserUuid, int xpToAdd, CancellationToken ct = default);
}

public class SupabaseLeaderboardXpStore(Supabase.Client supabase, IXPCalculator xpCalculator) : ILeaderboardXpStore
{
    public async Task<int> UpdateXpAsync(string browserUuid, int xpToAdd, CancellationToken ct = default)
    {

        var leaderboard = await supabase
            .From<LeaderboardEntry>()
            .Where(x => x.BrowserUuid == browserUuid)
            .Get(cancellationToken: ct);

        if (leaderboard.Model is null)
        {
            if (xpToAdd <= 0)
                return 0;
            await supabase
                .From<LeaderboardEntry>()
                .Insert(new LeaderboardEntry
                {
                    BrowserUuid = browserUuid,
                    Xp = xpToAdd,
                    UpdatedAt = DateTime.UtcNow
                }, cancellationToken: ct);
            return xpToAdd;
        }
        var curentLevel = xpCalculator.GetLevelByXp(leaderboard.Model.Xp);
        leaderboard.Model.Xp = Math.Min(curentLevel.CurrentLevelXp, leaderboard.Model.Xp + xpToAdd);
        leaderboard.Model.UpdatedAt = DateTime.UtcNow;
        await leaderboard.Model.Update<LeaderboardEntry>(cancellationToken: ct);
        return leaderboard.Model.Xp;
    }
}
