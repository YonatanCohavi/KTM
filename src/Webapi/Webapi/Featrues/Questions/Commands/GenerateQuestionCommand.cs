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

public class GenerateQuestionCommandHandler(ILogger<GenerateQuestionCommandHandler> logger, IKnessetAPI knessetAPI, IBrowserWeightCache weightCache, IMemoryCache memoryCache) : ICommandHandler<GenerateQuestionCommand, QuizQuestion>
{
    private readonly Random _random = Random.Shared;
    private readonly WeightedRandomSelector _selector = new();
    public async Task<QuizQuestion> ExecuteAsync(GenerateQuestionCommand command, CancellationToken ct)
    {
        var weights = await weightCache.GetWeightsAsync(command.UserId, ct);
        var members = await knessetAPI.GetKnessetMembersAsync(ct);
        var memberWeights = weights.ToDictionary(w => w.MemberId, w => (double?)w.Knowlage);

        var selectedGender = members[_random.Next(members.Length)].GenderId;
        var membersOfGender = members
            .Where(m => m.GenderId == selectedGender)
            .ToList();

        if (membersOfGender.Count < 4)
            throw new InvalidOperationException($"Not enough members of gender {selectedGender} to generate a question");

        var correctMember = _selector.SelectOne(
            membersOfGender,
            m => memberWeights.TryGetValue(m.MkId, out var weight) ? weight : null
        );

        var otherMembers = _selector.SelectMultiple(
            membersOfGender.Where(m => m.MkId != correctMember.MkId),
            3,
            m => memberWeights.TryGetValue(m.MkId, out var weight) ? weight : null
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
        var correntMemberIndex = question.Options.ToList().FindIndex(o => o.Id == correctMember.MkId);
        if (logger.IsEnabled(LogLevel.Information))
        {
            logger.LogInformation(
                "Generated question {QuestionId} for user {UserId} with correct member {CorrectMemberId} {CorrectMemberIndex}",
                question.Id,
                command.UserId,
                correctMember.MkId,
                correntMemberIndex + 1);
        }
        using var entiry = memoryCache.CreateEntry(CachedQuestion.CacheKey(question.Id))
            .SetValue(new CachedQuestion
            {
                QuestionId = question.Id,
                CorrectMemberId = correctMember.MkId,
                UserId = command.UserId,
                CreatedAt = DateTime.UtcNow,
                WrongAnswerCount = 0,
                Options = [.. question.Options.Select(o => o.Id)]
            })
            .SetSlidingExpiration(TimeSpan.FromMinutes(5));
        return question;
    }
}


