namespace Webapi.Featrues.Questions;

/// <summary>
/// Utility for selecting items from a collection using weighted probabilities.
/// Higher weight = higher probability of selection.
/// </summary>
public class WeightedRandomSelector
{
    private readonly Random _random;

    public WeightedRandomSelector(Random? random = null)
    {
        _random = random ?? Random.Shared;
    }

    /// <summary>
    /// Selects a single item from a weighted collection.
    /// </summary>
    /// <param name="items">Items to select from</param>
    /// <param name="weightSelector">Function to extract weight from each item</param>
    /// <returns>A randomly selected item based on weights</returns>
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

        // Fallback (should rarely happen due to floating point precision)
        return itemList[itemList.Count - 1];
    }

    /// <summary>
    /// Selects multiple unique items from a weighted collection.
    /// </summary>
    /// <param name="items">Items to select from</param>
    /// <param name="count">Number of items to select</param>
    /// <param name="weightSelector">Function to extract weight from each item</param>
    /// <returns>List of randomly selected unique items based on weights</returns>
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
