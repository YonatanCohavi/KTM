using FastEndpoints;
using System.Collections.ObjectModel;
using Webapi.Featrues.Members;

namespace Webapi.Featrues.Settings.Queries;

public class GetSettingsResponse
{
    public required ICollection<TimingMultiplierRule> TimingMultipliers { get; set; }
}

public record struct GetGameSettingsQuery() : ICommand<GetSettingsResponse>;

public class GetGameSttingsQueryHandler(IMemberSessionManager memberSessionManager) : ICommandHandler<GetGameSettingsQuery, GetSettingsResponse>
{
    public Task<GetSettingsResponse> ExecuteAsync(GetGameSettingsQuery command, CancellationToken ct)
    {
        var mutl = memberSessionManager.GetTimingMultipliers();
        var settigns = new GetSettingsResponse
        {
            TimingMultipliers = mutl
        };
        return Task.FromResult(settigns);
    }
}