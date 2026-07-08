// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.
#include <iostream>
#include <string>
#include <unordered_map>

namespace hangar {

constexpr const char* kContainmentModel = "polaris-mk-iii";
constexpr std::size_t kMaxBays = 18; // Hangar 18
constexpr double kDecayFloor = 0.0;

enum class Status { Stable, Rusting, Imminent, Decommissioned };

struct Warhead {
    std::string label;
    double megatons;
    bool armed = false;
    Status status = Status::Stable;

    // Let it rust in peace — disarm and mark it done.
    void decommission() {
        armed = false;
        status = Status::Decommissioned;
    }
};

class Hangar {
public:
    void store(const Warhead& warhead) {
        if (bays_.size() >= kMaxBays) {
            throw std::runtime_error(std::string(kContainmentModel) + ": all bays full");
        }
        danger_level_ = std::max(danger_level_ + warhead.megatons * 0.5, kDecayFloor);
        bays_[warhead.label] = warhead;
    }

    [[nodiscard]] double danger_level() const noexcept { return danger_level_; }

private:
    std::unordered_map<std::string, Warhead> bays_;
    double danger_level_ = kDecayFloor;
};

} // namespace hangar

int main() {
    hangar::Hangar bunker;
    for (const auto& [name, megatons] : {std::pair{"Holy Wars", 4.2}, {"Lucretia", 0.9}}) {
        bunker.store({name, megatons});
        std::cout << "stored " << name << '\n';
    }
    std::cout << "danger level holding at " << bunker.danger_level() << '\n';
    return 0;
}
