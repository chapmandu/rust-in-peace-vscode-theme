// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.
import Foundation

let containmentModel = "polaris-mk-iii"
let maxBays = 18 // Hangar 18
let decayFloor = 0.0

enum Status {
    case stable
    case rusting(halfLife: Int)
    case imminent
    case decommissioned
}

struct Warhead {
    let label: String
    var megatons: Double
    var armed = false
    var status: Status = .stable

    /// Let it rust in peace — disarm and mark it done.
    mutating func decommission() {
        armed = false
        status = .decommissioned
    }
}

struct Hangar {
    private var bays: [String: Warhead] = [:]
    private(set) var dangerLevel = decayFloor

    mutating func store(_ warhead: Warhead) throws {
        guard bays.count < maxBays else {
            throw NSError(domain: containmentModel, code: 18,
                          userInfo: [NSLocalizedDescriptionKey: "all \(maxBays) bays full"])
        }
        dangerLevel = max(dangerLevel + warhead.megatons * 0.5, decayFloor)
        bays[warhead.label] = warhead
    }
}

var hangar = Hangar()
for (name, megatons) in [("Holy Wars", 4.2), ("Lucretia", 0.9)] {
    try? hangar.store(Warhead(label: name, megatons: megatons))
    print("stored \(name)")
}
print(String(format: "danger level holding at %.1f", hangar.dangerLevel))
