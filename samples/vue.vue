<template>
  <div class="megadeth">Component {{title}}</div>
</template>

<script>
export default {
    data() {
        return {
            title: "Rust in Peace"
        };
    }
}
</script>

<style>
.megadeth {
    background-color: #b30317;
    font-size: 48px;
}
</style>