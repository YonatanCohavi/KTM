using FastEndpoints;
using Microsoft.Extensions.Caching.Memory;
using Webapi.Featrues.Knesset;

namespace Webapi.Featrues.Questions.Commands;

public class QuestionOption
{
    public required int Id { get; set; }
    public required string Name { get; set; }
}
public class QuizQuestion
{
    public Guid Id { get; set; }
    public required int CorrectMemberId { get; set; }
    public required QuestionOption[] Options { get; set; }
}

public record struct GenerateQuestionCommand(string UserId) : ICommand<QuizQuestion>;

public record GenerateQuestionCommandWithWeights(
    string UserId,
    int[]? Exclude,
    Dictionary<int, double>? MemberWeights
) : ICommand<QuizQuestion>;

public class GenerateQuestionCommandHandler(IKnessetAPI knessetAPI, IBrowserWeightCache weightCache, IMemoryCache memoryCache) : ICommandHandler<GenerateQuestionCommand, QuizQuestion>
{
    private readonly Random _random = Random.Shared;
    private readonly WeightedRandomSelector _selector = new();
    public async Task<QuizQuestion> ExecuteAsync(GenerateQuestionCommand command, CancellationToken ct)
    {
        var weights = await weightCache.GetWeightsAsync(command.UserId, ct);
        var members = await knessetAPI.GetKnessetMembersAsync(ct);
        var allmembersWeights = members.ToDictionary(m => m.MkId, m => weights.FirstOrDefault(w => w.MemberId == m.MkId)?.Knowlage ?? 1.0);

        var selectedGender = members[_random.Next(members.Length)].GenderId;
        var membersOfGender = members
            .Where(m => m.GenderId == selectedGender)
            .ToList();

        if (membersOfGender.Count < 4)
            throw new InvalidOperationException($"Not enough members of gender {selectedGender} to generate a question");

        var correctMember = _selector.SelectOne(
            membersOfGender,
            m => allmembersWeights[m.MkId]
        );

        var otherMembers = _selector.SelectMultiple(
            membersOfGender.Where(m => m.MkId != correctMember.MkId),
            3,
            m => allmembersWeights[m.MkId]
        ).ToList();

        var shuffledOptions = new[] { correctMember }.Concat(otherMembers).OrderBy(x => _random.Next());
        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            CorrectMemberId = correctMember.MkId,
            Options = [.. shuffledOptions.Select(m => new QuestionOption
            {
                Id = m.MkId,
                Name = $"{m.Firstname} {m.Lastname}"
            })]
        };
        using var entiry = memoryCache.CreateEntry(CachedQuestion.CacheKey(question.Id))
            .SetValue(new CachedQuestion
            {
                QuestionId = question.Id,
                CorrectMemberId = correctMember.MkId,
                UserId = command.UserId,
                CreatedAt = DateTime.UtcNow,
                WrongAnswerCount = 0
            })
            .SetSlidingExpiration(TimeSpan.FromMinutes(5));
        return question;
    }
}


