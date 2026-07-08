/* Polaris — the hangar's containment ledger.
 * Every warhead rusts in peace, each on its own schedule. */
#include <stdio.h>
#include <string.h>

#define CONTAINMENT_MODEL "polaris-mk-iii"
#define MAX_BAYS 18 /* Hangar 18 */
#define DECAY_FLOOR 0.0

typedef enum { STABLE, RUSTING, IMMINENT, DECOMMISSIONED } Status;

typedef struct {
    char label[32];
    double megatons;
    int armed;
    Status status;
} Warhead;

typedef struct {
    Warhead bays[MAX_BAYS];
    size_t count;
    double danger_level;
} Hangar;

/* Returns 0 on success, -1 when every bay is full. */
int store(Hangar *hangar, const char *label, double megatons) {
    if (hangar->count >= MAX_BAYS) {
        fprintf(stderr, "%s: all %d bays full\n", CONTAINMENT_MODEL, MAX_BAYS);
        return -1;
    }
    Warhead *bay = &hangar->bays[hangar->count++];
    strncpy(bay->label, label, sizeof(bay->label) - 1);
    bay->megatons = megatons;
    bay->armed = 0;
    bay->status = STABLE;
    hangar->danger_level += megatons * 0.5;
    return 0;
}

int main(void) {
    Hangar hangar = { .count = 0, .danger_level = DECAY_FLOOR };
    const char *stock[] = { "Holy Wars", "Tornado of Souls", "Lucretia" };
    const double yield[] = { 4.2, 1.5, 0.9 };

    for (size_t i = 0; i < sizeof(yield) / sizeof(*yield); i++) {
        if (store(&hangar, stock[i], yield[i]) == 0) {
            printf("stored %s\n", stock[i]);
        }
    }
    printf("danger level holding at %.1f\n", hangar.danger_level);
    return 0;
}
