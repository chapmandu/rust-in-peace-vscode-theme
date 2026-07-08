<?php

// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.

declare(strict_types=1);

namespace Hangar\Containment;

const CONTAINMENT_MODEL = 'polaris-mk-iii';
const MAX_BAYS = 18; // Hangar 18
const DECAY_FLOOR = 0.0;

enum Status: string
{
    case Stable = 'stable';
    case Rusting = 'rusting';
    case Imminent = 'imminent';
    case Decommissioned = 'decommissioned';
}

final class Warhead
{
    public function __construct(
        public readonly string $label,
        public float $megatons,
        public bool $armed = false,
        public Status $status = Status::Stable,
    ) {
    }

    /** Let it rust in peace — disarm and mark it done. */
    public function decommission(): Status
    {
        $this->armed = false;
        return $this->status = Status::Decommissioned;
    }
}

final class Hangar
{
    /** @var array<string, Warhead> */
    private array $bays = [];
    private float $dangerLevel = DECAY_FLOOR;

    public function store(Warhead $warhead): void
    {
        if (count($this->bays) >= MAX_BAYS) {
            throw new \RuntimeException(CONTAINMENT_MODEL . ': all ' . MAX_BAYS . ' bays full');
        }
        $this->dangerLevel = max($this->dangerLevel + $warhead->megatons * 0.5, DECAY_FLOOR);
        $this->bays[$warhead->label] = $warhead;
    }

    public function dangerLevel(): float
    {
        return $this->dangerLevel;
    }
}

$hangar = new Hangar();
foreach (['Holy Wars' => 4.2, 'Lucretia' => 0.9] as $name => $megatons) {
    $hangar->store(new Warhead($name, $megatons));
    printf("stored %s\n", $name);
}
printf("danger level holding at %.1f\n", $hangar->dangerLevel());
