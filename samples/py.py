"""Polaris — the hangar's containment ledger.

Every warhead rusts in peace, each on its own schedule.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

CONTAINMENT_MODEL = "polaris-mk-iii"
MAX_BAYS = 18  # Hangar 18
DECAY_FLOOR = 0.0


class Status(Enum):
    STABLE = "stable"
    RUSTING = "rusting"
    IMMINENT = "imminent"
    DECOMMISSIONED = "decommissioned"


@dataclass
class Warhead:
    label: str
    megatons: float
    armed: bool = False
    status: Status = Status.STABLE

    def decommission(self) -> Status:
        """Let it rust in peace — disarm and mark it done."""
        self.armed = False
        self.status = Status.DECOMMISSIONED
        return self.status


@dataclass
class Hangar:
    bays: dict[str, Warhead] = field(default_factory=dict)
    danger_level: float = DECAY_FLOOR

    def store(self, warhead: Warhead) -> None:
        if len(self.bays) >= MAX_BAYS:
            raise RuntimeError(f"{CONTAINMENT_MODEL}: all {MAX_BAYS} bays full")
        self.danger_level = max(self.danger_level + warhead.megatons * 0.5, DECAY_FLOOR)
        self.bays[warhead.label] = warhead


if __name__ == "__main__":
    hangar = Hangar()
    for name, megatons in [("Holy Wars", 4.2), ("Tornado of Souls", 1.5), ("Lucretia", 0.9)]:
        hangar.store(Warhead(name, megatons))
        print(f"stored {name}")
    print(f"danger level holding at {hangar.danger_level:.1f}")
