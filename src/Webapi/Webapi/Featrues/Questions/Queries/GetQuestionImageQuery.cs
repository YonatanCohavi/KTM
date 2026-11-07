using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Knesset;

namespace Webapi.Featrues.Questions.Queries;

public record struct GetQuestionImageQuery(Guid QuestionId) : ICommand<Stream>;
public class GetQuestionImageQueryHandler(IKnessetAPI knessetAPI,IMemoryCache memoryCache) : ICommandHandler<GetQuestionImageQuery, Stream>
{
    public async Task<Stream> ExecuteAsync(GetQuestionImageQuery command, CancellationToken ct)
    {
        var question = memoryCache.Get<CachedQuestion>(CachedQuestion.CacheKey(command.QuestionId)) 
            ?? throw new InvalidOperationException($"Question with ID {command.QuestionId} not found in cache.");
        return await knessetAPI.GetMemberImageAsync(question.CorrectMemberId, ct);
    }
}

