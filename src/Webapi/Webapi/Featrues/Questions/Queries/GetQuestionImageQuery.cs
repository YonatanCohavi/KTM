using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Knesset;

namespace Webapi.Featrues.Questions.Queries;

public record struct GetQuestionImageQuery(Guid QuestionId,int? OptionIndex = null) : ICommand<Stream>;
public class GetQuestionImageQueryHandler(IKnessetAPI knessetAPI,IMemoryCache memoryCache) : ICommandHandler<GetQuestionImageQuery, Stream>
{
    public async Task<Stream> ExecuteAsync(GetQuestionImageQuery command, CancellationToken ct)
    {
        var question = memoryCache.Get<CachedQuestion>(CachedQuestion.CacheKey(command.QuestionId)) 
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache.");
        if (command.OptionIndex.HasValue)
        {
            var option = question.Options.ElementAtOrDefault(command.OptionIndex.Value);
            if (option == default)
                throw new InvalidOperationException($"Option with ID {command.OptionIndex.Value} not found in question {command.QuestionId}.");
            return await knessetAPI.GetMemberImageAsync(option, ct);
        }
        return await knessetAPI.GetMemberImageAsync(question.CorrectMemberId, ct);
    }
}

