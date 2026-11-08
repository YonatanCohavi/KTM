
using FastEndpoints;
using Webapi.Featrues.Questions;

namespace Webapi.Featrues.User.Queries;

public record GetUserStatsQuery(string UserId) : ICommand<UserStats>;
public class GetUserStatsQueryHandler(ILeaderboardXpStore leaderboardXpStore,IXPCalculator xpCalculator) : ICommandHandler<GetUserStatsQuery, UserStats>
{
    public async Task<UserStats> ExecuteAsync(GetUserStatsQuery query, CancellationToken ct)
    {
        var user = await leaderboardXpStore.GetUserEntry(query.UserId);
        var level = xpCalculator.GetLevelByXp(user.Xp);
        return new UserStats
        {
            CurrentLevelXp = user.Xp,
            Level = level,
            Name = "",
            Streak = user.Streak
        };
    }
}
