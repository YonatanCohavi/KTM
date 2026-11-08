using FastEndpoints;
using Webapi.Featrues.Questions;

namespace Webapi.Featrues.Users.Queries;

public record struct GetLeaderBoardMembersQuery : ICommand<LeaderBoardMember[]>;
public class GetLeaderBoardMembersQueryHandler(ILeaderboardXpStore leaderboardXpStore,IXPCalculator xpCalculator) : ICommandHandler<GetLeaderBoardMembersQuery, LeaderBoardMember[]>
{
    public async Task<LeaderBoardMember[]> ExecuteAsync(GetLeaderBoardMembersQuery query, CancellationToken ct)
    {
        var leaders = await leaderboardXpStore.GetAll();

        return [.. leaders.OrderByDescending(l => l.Xp).Select(l => {
            var level =   xpCalculator.GetLevelByXp(l.Xp);
            return new LeaderBoardMember
            {
                UserId = l.BrowserUuid,
                Name = l.PlayerName,
                Level = level.Level,
                Streak = l.Streak,
                Xp = l.Xp
            }; 
        })];
    }
}