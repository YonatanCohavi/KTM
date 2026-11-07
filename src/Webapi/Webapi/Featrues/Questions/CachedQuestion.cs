namespace Webapi.Featrues.Questions;


public class CachedQuestion
{
    public static string CacheKey(Guid questionId) => $"question_{questionId}";
    public Guid QuestionId { get; set; }
    public int CorrectMemberId { get; set; }
    public required string UserId { get; set; }
    public required DateTime CreatedAt { get; set; }
}
