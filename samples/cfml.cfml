/*
 * Polaris — the hangar's containment ledger.
 * Every warhead rusts in peace, each on its own schedule.
 */
component accessors="true" {

	property name="containmentModel" type="string" default="polaris-mk-iii";
	property name="maxBays" type="numeric" default="18"; // Hangar 18
	property name="dangerLevel" type="numeric" default="0.0";

	variables.bays = {};

	public void function store(required string label, required numeric megatons) {
		if (structCount(variables.bays) >= getMaxBays()) {
			throw(type="Containment", message="#getContainmentModel()#: all #getMaxBays()# bays full");
		}
		variables.bays[arguments.label] = {
			megatons = arguments.megatons,
			armed = false,
			status = "stable"
		};
		setDangerLevel(getDangerLevel() + arguments.megatons * 0.5);
	}

	// Let it rust in peace — disarm and mark it done.
	public struct function decommission(required string label) {
		var bay = variables.bays[arguments.label];
		bay.armed = false;
		bay.status = "decommissioned";
		return bay;
	}

	public numeric function count() {
		return structCount(variables.bays);
	}
}
