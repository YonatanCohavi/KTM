using FastEndpoints;
using Webapi.Featrues.Questions.Commands;

namespace Webapi.Featrues.Questions.Endpoints;

public record struct GenerateQuestionResponse(QuizQuestion question);

public class GenerateQuestion : Endpoint<GenerateQuestionRequest, GenerateQuestionResponse>
{
    private readonly IBrowserWeightCache _weightCache;

    public GenerateQuestion(IBrowserWeightCache weightCache)
    {
        _weightCache = weightCache;
    }

    public override void Configure()
    {
        Post("/question/next");
    }

    public override async Task<GenerateQuestionResponse> ExecuteAsync(GenerateQuestionRequest req, CancellationToken ct)
    {
        // Convert weights array to dictionary for easier lookup
        var weightsDict = req.Weights?.ToDictionary(w => w.Id, w => w.Weight);
        
        var command = new GenerateQuestionCommandWithWeights(req.BrowserId, req.Exclude, weightsDict);
        var question = await command.ExecuteAsync(ct);
        
        return new GenerateQuestionResponse(question);
    }
}

// Keep the old endpoint for backward compatibility
public class GenerateQuestionLegacy : EndpointWithoutRequest<GenerateQuestionResponse>
{
    public override void Configure()
    {
        Get("/question/next");
    }

    public override async Task<GenerateQuestionResponse> ExecuteAsync(CancellationToken ct)
    {
        var command = new GenerateQuestionCommand();
        var question = await command.ExecuteAsync(ct);
        return new GenerateQuestionResponse(question);
    }
}
