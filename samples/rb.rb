# Polaris — the hangar's containment ledger.
# Every warhead rusts in peace, each on its own schedule.

CONTAINMENT_MODEL = "polaris-mk-iii"
MAX_BAYS = 18 # Hangar 18
DECAY_FLOOR = 0.0

class Warhead
  attr_reader :label, :megatons
  attr_accessor :armed, :status

  def initialize(label, megatons)
    @label = label
    @megatons = megatons
    @armed = false
    @status = :stable
  end

  # Let it rust in peace — disarm and mark it done.
  def decommission!
    @armed = false
    @status = :decommissioned
  end
end

class Hangar
  def initialize
    @bays = {}
    @danger_level = DECAY_FLOOR
  end

  def store(warhead)
    raise "#{CONTAINMENT_MODEL}: all #{MAX_BAYS} bays full" if @bays.size >= MAX_BAYS

    @danger_level = [@danger_level + warhead.megatons * 0.5, DECAY_FLOOR].max
    @bays[warhead.label] = warhead
  end

  attr_reader :danger_level
end

hangar = Hangar.new
{ "Holy Wars" => 4.2, "Tornado of Souls" => 1.5, "Lucretia" => 0.9 }.each do |name, megatons|
  hangar.store(Warhead.new(name, megatons))
  puts "stored #{name}"
end
puts format("danger level holding at %.1f", hangar.danger_level)
