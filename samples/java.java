// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.
package hangar;

import java.util.HashMap;
import java.util.Map;

public final class Hangar {

    static final String CONTAINMENT_MODEL = "polaris-mk-iii";
    static final int MAX_BAYS = 18; // Hangar 18
    static final double DECAY_FLOOR = 0.0;

    enum Status { STABLE, RUSTING, IMMINENT, DECOMMISSIONED }

    record Warhead(String label, double megatons, boolean armed, Status status) {
        /* Let it rust in peace — disarm and mark it done. */
        Warhead decommission() {
            return new Warhead(label, megatons, false, Status.DECOMMISSIONED);
        }
    }

    private final Map<String, Warhead> bays = new HashMap<>();
    private double dangerLevel = DECAY_FLOOR;

    void store(Warhead warhead) {
        if (bays.size() >= MAX_BAYS) {
            throw new IllegalStateException(CONTAINMENT_MODEL + ": all " + MAX_BAYS + " bays full");
        }
        dangerLevel = Math.max(dangerLevel + warhead.megatons() * 0.5, DECAY_FLOOR);
        bays.put(warhead.label(), warhead);
    }

    public static void main(String[] args) {
        var hangar = new Hangar();
        var stock = Map.of("Holy Wars", 4.2, "Lucretia", 0.9);
        stock.forEach((name, megatons) -> {
            hangar.store(new Warhead(name, megatons, false, Status.STABLE));
            System.out.printf("stored %s%n", name);
        });
        System.out.printf("danger level holding at %.1f%n", hangar.dangerLevel);
    }
}
