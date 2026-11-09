namespace Webapi.Featrues.Questions;

/// <summary>
/// Utility for selecting items from a collection using weighted probabilities.
/// Higher weight = higher probability of selection.
/// </summary>
public class WeightedRandomSelector(Random? random = null)
{
    private readonly Random _random = random ?? Random.Shared;

    public T SelectOne<T>(IEnumerable<T> items, Func<T, double?> weightSelector)
    {
        var itemList = items.ToList();
        if (itemList.Count == 0)
            throw new ArgumentException("Items collection cannot be empty");

        var unweightedItems = itemList.Where(item => !weightSelector(item).HasValue).ToList();
        if (unweightedItems.Count > 0)
            return unweightedItems[_random.Next(unweightedItems.Count)];

        var weightedItems = itemList
            .Select(item => new { Item = item, Weight = weightSelector(item) })
            .Where(x => x.Weight.HasValue)
            .Select(x => new { x.Item, Weight = x.Weight!.Value })
            .ToList();

        var totalWeight = weightedItems.Sum(x => x.Weight);
        if (totalWeight <= 0)
            throw new ArgumentException("Total weight must be greater than 0");

        var randomValue = _random.NextDouble() * totalWeight;
        var cumulative = 0.0;

        foreach (var weightedItem in weightedItems)
        {
            cumulative += weightedItem.Weight;
            if (randomValue <= cumulative)
                return weightedItem.Item;
        }

        return weightedItems[^1].Item;
    }

    public List<T> SelectMultiple<T>(IEnumerable<T> items, int count, Func<T, double?> weightSelector)
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
