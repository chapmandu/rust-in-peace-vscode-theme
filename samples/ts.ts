// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.

const CONTAINMENT_MODEL = "polaris-mk-iii";
const MAX_BAYS = 18; // Hangar 18
const DECAY_FLOOR = 0.0;

type Status = "stable" | "rusting" | "imminent" | "decommissioned";

interface Warhead {
  readonly label: string;
  megatons: number;
  armed: boolean;
  status: Status;
}

class Hangar {
  private readonly bays = new Map<string, Warhead>();
  private dangerLevel = DECAY_FLOOR;

  store(warhead: Warhead): void {
    if (this.bays.size >= MAX_BAYS) {
      throw new Error(`${CONTAINMENT_MODEL}: all ${MAX_BAYS} bays full`);
    }
    this.dangerLevel = Math.max(this.dangerLevel + warhead.megatons * 0.5, DECAY_FLOOR);
    this.bays.set(warhead.label, warhead);
  }

  /** Let it rust in peace — disarm and mark it done. */
  decommission(label: string): Status | undefined {
    const warhead = this.bays.get(label);
    if (!warhead) return undefined;
    warhead.armed = false;
    warhead.status = "decommissioned";
    return warhead.status;
  }

  get level(): number {
    return this.dangerLevel;
  }
}

const hangar = new Hangar();
for (const [label, megatons] of [["Holy Wars", 4.2], ["Lucretia", 0.9]] as const) {
  hangar.store({ label, megatons, armed: false, status: "stable" });
  console.log(`stored ${label}`);
}
console.log(`danger level holding at ${hangar.level.toFixed(1)}`);
