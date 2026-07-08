// Polaris — the hangar's containment ledger.
// Every warhead rusts in peace, each on its own schedule.
package main

import "fmt"

const (
	ContainmentModel = "polaris-mk-iii"
	MaxBays          = 18 // Hangar 18
	DecayFloor       = 0.0
)

// Status tracks how far along a warhead is toward rusting in peace.
type Status int

const (
	Stable Status = iota
	Rusting
	Imminent
	Decommissioned
)

type Warhead struct {
	Label    string
	Megatons float64
	Armed    bool
	Status   Status
}

type Hangar struct {
	bays        map[string]*Warhead
	dangerLevel float64
}

func NewHangar() *Hangar {
	return &Hangar{bays: make(map[string]*Warhead), dangerLevel: DecayFloor}
}

func (h *Hangar) Store(w *Warhead) error {
	if len(h.bays) >= MaxBays {
		return fmt.Errorf("%s: all %d bays full", ContainmentModel, MaxBays)
	}
	h.dangerLevel += w.Megatons * 0.5
	h.bays[w.Label] = w
	return nil
}

func main() {
	hangar := NewHangar()
	stock := []*Warhead{{Label: "Holy Wars", Megatons: 4.2}, {Label: "Lucretia", Megatons: 0.9}}
	for _, w := range stock {
		if err := hangar.Store(w); err != nil {
			fmt.Println("rejected:", err)
			continue
		}
		fmt.Printf("stored %s\n", w.Label)
	}
	fmt.Printf("danger level holding at %.1f\n", hangar.dangerLevel)
}
