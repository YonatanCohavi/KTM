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

public record struct GenerateQuestionCommand : ICommand<QuizQuestion>;

public record GenerateQuestionCommandWithWeights(
    string BrowserId,
    int[]? Exclude,
    Dictionary<int, double>? MemberWeights
) : ICommand<QuizQuestion>;

public class GenerateQuestionCommandHandler(IKnessetAPI knessetAPI, IMemoryCache memoryCache) : ICommandHandler<GenerateQuestionCommand, QuizQuestion>
{
    private readonly Random _random = Random.Shared;
    
    public async Task<QuizQuestion> ExecuteAsync(GenerateQuestionCommand command, CancellationToken ct)
    {
        var handler = new GenerateQuestionCommandWithWeightsHandler(knessetAPI, memoryCache, new BrowserWeightCache(memoryCache));
        return await handler.ExecuteAsync(new GenerateQuestionCommandWithWeights("unknown", null, null), ct);
    }
}

public class GenerateQuestionCommandWithWeightsHandler : ICommandHandler<GenerateQuestionCommandWithWeights, QuizQuestion>
{
    private readonly IKnessetAPI _knessetAPI;
    private readonly IMemoryCache _memoryCache;
    private readonly IBrowserWeightCache _weightCache;
    private readonly WeightedRandomSelector _selector = new();
    private readonly Random _random = Random.Shared;

    public GenerateQuestionCommandWithWeightsHandler(
        IKnessetAPI knessetAPI,
        IMemoryCache memoryCache,
        IBrowserWeightCache weightCache)
    {
        _knessetAPI = knessetAPI;
        _memoryCache = memoryCache;
        _weightCache = weightCache;
    }

    public async Task<QuizQuestion> ExecuteAsync(GenerateQuestionCommandWithWeights command, CancellationToken ct)
    {
        var members = await _knessetAPI.GetKnessetMembersAsync(ct);
        
        // Resolve weights: client-sent → cached → default uniform
        var weightsToUse = ResolveWeights(command.BrowserId, command.MemberWeights);
        
        // Filter excluded members
        var availableMembers = command.Exclude != null && command.Exclude.Length > 0
            ? members.Where(m => !command.Exclude.Contains(m.MkId)).ToArray()
            : members;

        if (availableMembers.Length < 4)
            throw new InvalidOperationException("Not enough members available to generate a question");

        // Select a random gender to ensure demographic consistency
        var selectedGender = availableMembers[_random.Next(availableMembers.Length)].GenderId;
        var membersOfGender = availableMembers
            .Where(m => m.GenderId == selectedGender)
            .ToList();

        if (membersOfGender.Count < 4)
            throw new InvalidOperationException($"Not enough members of gender {selectedGender} to generate a question");

        // Weighted selection: higher weight = higher chance of being selected
        var correctMember = _selector.SelectOne(
            membersOfGender,
            m => GetMemberWeight(m.MkId, weightsToUse)
        );

        // Select 3 additional unique members (also weighted)
        var otherMembers = membersOfGender.Where(m => m.MkId != correctMember.MkId).ToList();
        var optionMembers = _selector.SelectMultiple(otherMembers, 3, m => GetMemberWeight(m.MkId, weightsToUse));

        var selectedMembers = new[] { correctMember }.Concat(optionMembers).ToArray();
        
        // Shuffle options to avoid position bias
        var shuffledOptions = selectedMembers.OrderBy(x => _random.Next()).ToArray();

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

        _memoryCache.CreateEntry($"question_{question.Id}")
            .SetValue(new { question.Id, CorrectMemberId = correctMember.MkId })
            .SetSlidingExpiration(TimeSpan.FromMinutes(5));

        return question;
    }

    private Dictionary<int, double> ResolveWeights(string browserId, Dictionary<int, double>? clientWeights)
    {
        // Priority: Client-sent weights → Cached weights → Empty (default uniform 1.0)
        if (clientWeights != null && clientWeights.Count > 0)
        {
            // Client sent new weights, cache them for next time
            _weightCache.SetWeights(browserId, clientWeights);
            return clientWeights;
        }

        // Try to get cached weights for this browser
        var cachedWeights = _weightCache.GetWeights(browserId);
        return cachedWeights ?? new Dictionary<int, double>();
    }

    private double GetMemberWeight(int memberId, Dictionary<int, double> weights)
    {
        if (weights.Count == 0)
            return 1.0; // Default weight if none provided

        return weights.TryGetValue(memberId, out var weight) ? weight : 1.0;
    }
}
