//! Polaris — the hangar's containment ledger.
//! Every warhead rusts in peace, each on its own schedule.

use std::collections::HashMap;

const CONTAINMENT_MODEL: &str = "polaris-mk-iii";
const MAX_BAYS: usize = 18; // Hangar 18
const DECAY_FLOOR: f64 = 0.0;

#[derive(Debug, Clone, PartialEq)]
enum Status {
    Stable,
    Rusting { half_life: u32 },
    Imminent,
    Decommissioned,
}

#[derive(Debug, Clone)]
pub struct Warhead {
    label: String,
    megatons: f64,
    armed: bool,
    status: Status,
}

impl Warhead {
    pub fn new(label: impl Into<String>, megatons: f64) -> Self {
        Self { label: label.into(), megatons, armed: false, status: Status::Stable }
    }

    /// Let it rust in peace — disarm and mark it done.
    pub fn decommission(&mut self) -> &Status {
        self.armed = false;
        self.status = Status::Decommissioned;
        &self.status
    }
}

pub struct Hangar {
    bays: HashMap<String, Warhead>,
    danger_level: f64,
}

impl Hangar {
    pub fn store(&mut self, w: Warhead) -> Result<(), String> {
        if self.bays.len() >= MAX_BAYS {
            return Err(format!("{CONTAINMENT_MODEL}: all {MAX_BAYS} bays full"));
        }
        self.danger_level = (self.danger_level + w.megatons * 0.5).max(DECAY_FLOOR);
        self.bays.insert(w.label.clone(), w);
        Ok(())
    }
}

fn main() {
    let mut hangar = Hangar { bays: HashMap::new(), danger_level: DECAY_FLOOR };
    for (name, mt) in [("Holy Wars", 4.2), ("Tornado of Souls", 1.5), ("Lucretia", 0.9)] {
        match hangar.store(Warhead::new(name, mt)) {
            Ok(()) => println!("stored {name}"),
            Err(e) => eprintln!("rejected: {e}"),
        }
    }
    println!("danger level holding at {:.1}", hangar.danger_level);
}
