// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.

const CONTAINMENT_MODEL = "polaris-mk-iii";
const MAX_BAYS = 18; // Hangar 18
const DECAY_FLOOR = 0.0;

class Warhead {
  constructor(label, megatons) {
    this.label = label;
    this.megatons = megatons;
    this.armed = false;
    this.status = "stable";
  }

  // Let it rust in peace — disarm and mark it done.
  decommission() {
    this.armed = false;
    this.status = "decommissioned";
    return this.status;
  }
}

class Hangar {
  #bays = new Map();
  #dangerLevel = DECAY_FLOOR;

  store(warhead) {
    if (this.#bays.size >= MAX_BAYS) {
      throw new Error(`${CONTAINMENT_MODEL}: all ${MAX_BAYS} bays full`);
    }
    this.#dangerLevel = Math.max(this.#dangerLevel + warhead.megatons * 0.5, DECAY_FLOOR);
    this.#bays.set(warhead.label, warhead);
  }

  get level() {
    return this.#dangerLevel;
  }
}

const hangar = new Hangar();
for (const [name, megatons] of [["Holy Wars", 4.2], ["Lucretia", 0.9]]) {
  hangar.store(new Warhead(name, megatons));
  console.log(`stored ${name}`);
}
console.log(`danger level holding at ${hangar.level.toFixed(1)}`);

export { Warhead, Hangar };
