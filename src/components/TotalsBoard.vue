<script setup>
const props = defineProps(['totals'])
</script>

<template>

<h3>Totals</h3>

<div v-for="(v,k) in totals" :key="k">

{{k}} : {{v}}

</div>

</template>