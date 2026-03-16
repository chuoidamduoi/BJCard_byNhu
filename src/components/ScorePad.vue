<script setup>

const props = defineProps(['players','dealer','scores','step'])

function add(p,val){

 if(!props.scores[p]) props.scores[p]=0

 props.scores[p]+=val

}
</script>

<template>

<div v-for="p in players" :key="p">

<div v-if="p!==dealer">

{{p}}

<button @click="add(p,-step)">-</button>

{{scores[p]||0}}

<button @click="add(p,step)">+</button>

</div>

<div v-else>
Dealer: {{p}}
</div>

</div>

</template>