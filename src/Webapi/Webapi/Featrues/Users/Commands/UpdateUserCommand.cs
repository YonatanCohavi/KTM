
using FastEndpoints;
using Webapi.Featrues.Questions;

namespace Webapi.Featrues.Users.Commands;

public record UpdateUserCommand(string UserId, string? Name) : ICommand;
public class UpdateUserCommandHandler(ILeaderboardXpStore leaderboardXpStore) : ICommandHandler<UpdateUserCommand>
{
    public async Task ExecuteAsync(UpdateUserCommand command, CancellationToken ct)
    {
        var user = await leaderboardXpStore.GetUserEntry(command.UserId) ?? throw new Exception("User not found");
        user.PlayerName = command.Name ?? user.PlayerName;
        await leaderboardXpStore.UpdateUserEntity(user);
    }
}

