namespace Webapi.Featrues.Questions;

/// <summary>
/// Utility for selecting items from a collection using weighted probabilities.
/// Higher weight = higher probability of selection.
/// </summary>
public class WeightedRandomSelector(Random? random = null)
{
    private readonly Random _random = random ?? Random.Shared;

    public T SelectOne<T>(IEnumerable<T> items, Func<T, double> weightSelector)
    {
        var itemList = items.ToList();
        if (itemList.Count == 0)
            throw new ArgumentException("Items collection cannot be empty");

        var weights = itemList.Select(weightSelector).ToList();
        var totalWeight = weights.Sum();

        if (totalWeight <= 0)
            throw new ArgumentException("Total weight must be greater than 0");

        var randomValue = _random.NextDouble() * totalWeight;
        var cumulative = 0.0;

        for (int i = 0; i < itemList.Count; i++)
        {
            cumulative += weights[i];
            if (randomValue <= cumulative)
                return itemList[i];
        }

        return itemList[^1];
    }

    public List<T> SelectMultiple<T>(IEnumerable<T> items, int count, Func<T, double> weightSelector)
    {
        var itemList = items.ToList();
        if (count > itemList.Count)
            throw new ArgumentException($"Cannot select {count} items from collection of size {itemList.Count}");

        var result = new List<T>();
        var remaining = new List<T>(itemList);

        for (int i = 0; i < count; i++)
        {
            var selected = SelectOne(remaining, weightSelector);
            result.Add(selected);
            remaining.Remove(selected);
        }

        return result;
    }
}
