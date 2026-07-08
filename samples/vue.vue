<!-- Polaris — a single hangar bay, rendered. -->
<template>
  <article class="bay" :data-status="warhead.status">
    <h2>{{ warhead.label }}</h2>
    <p class="megatons">{{ warhead.megatons.toFixed(1) }} Mt</p>
    <button v-if="warhead.armed" type="button" @click="decommission">
      Let it rust in peace
    </button>
    <span v-else class="resting">decommissioned</span>
  </article>
</template>

<script setup>
import { reactive } from "vue";

const CONTAINMENT_MODEL = "polaris-mk-iii";

const warhead = reactive({
  label: "Lucretia",
  megatons: 0.9,
  armed: true,
  status: "imminent",
});

// Let it rust in peace — disarm and mark it done.
function decommission() {
  warhead.armed = false;
  warhead.status = "decommissioned";
  console.log(`${CONTAINMENT_MODEL}: ${warhead.label} stood down`);
}
</script>

<style scoped>
.bay {
  background: #1c2547;
  color: #d3e0f0;
  border-radius: 6px;
  padding: 1rem;
}
.bay[data-status="imminent"] {
  border: 1px solid #eb8667;
}
.megatons {
  color: #e8e274;
}
</style>
