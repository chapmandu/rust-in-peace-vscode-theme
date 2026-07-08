// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Hangar.Containment;

public enum Status { Stable, Rusting, Imminent, Decommissioned }

public record Warhead(string Label, double Megatons, bool Armed = false, Status Status = Status.Stable)
{
    // Let it rust in peace — disarm and mark it done.
    public Warhead Decommission() => this with { Armed = false, Status = Status.Decommissioned };
}

public sealed class Hangar
{
    private const string ContainmentModel = "polaris-mk-iii";
    private const int MaxBays = 18; // Hangar 18
    private const double DecayFloor = 0.0;

    private readonly Dictionary<string, Warhead> _bays = new();
    private double _dangerLevel = DecayFloor;

    public void Store(Warhead warhead)
    {
        if (_bays.Count >= MaxBays)
            throw new InvalidOperationException($"{ContainmentModel}: all {MaxBays} bays full");

        _dangerLevel = Math.Max(_dangerLevel + warhead.Megatons * 0.5, DecayFloor);
        _bays[warhead.Label] = warhead;
    }

    public double DangerLevel => _dangerLevel;

    public static void Main()
    {
        var hangar = new Hangar();
        var stock = new[] { ("Holy Wars", 4.2), ("Lucretia", 0.9) };
        foreach (var (name, megatons) in stock.OrderByDescending(w => w.Item2))
        {
            hangar.Store(new Warhead(name, megatons));
            Console.WriteLine($"stored {name}");
        }
        Console.WriteLine($"danger level holding at {hangar.DangerLevel:F1}");
    }
}
