using FastEndpoints;
using Webapi.Featrues.Questions;

namespace Webapi.Featrues.Users.Commands;

public record ResetUserCommand(string UserId) : ICommand;


public class ResetUserCommandHandler(ILeaderboardXpStore leaderboardXpStore,IBrowserWeightCache browserWeightCache) : ICommandHandler<ResetUserCommand>
{
    public async Task ExecuteAsync(ResetUserCommand command, CancellationToken ct)
    {
        var user = await leaderboardXpStore.GetUserEntry(command.UserId) ?? throw new Exception("User not found");
        user.Xp = 0;
        user.Streak = 0;
        user.MaxStreak = 0;
        await leaderboardXpStore.UpdateUserEntity(user);
        await browserWeightCache.ResetWeightsAsync(command.UserId, ct);
    }
}

