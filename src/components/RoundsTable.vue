<script setup>
const props = defineProps(['rounds','players'])
</script>

<template>

<h3>Rounds</h3>

<table>

<thead>

<tr>
<th>#</th>
<th>Dealer</th>
<th v-for="p in players">{{p}}</th>
</tr>

</thead>

<tbody>

<tr v-for="r in rounds">

<td>{{r.round}}</td>
<td>{{r.dealer}}</td>

<td v-for="p in players">
{{r.scores[p]}}
</td>

</tr>

</tbody>

</table>

</template>