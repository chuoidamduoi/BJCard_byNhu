<script setup>
import { ref } from 'vue'
import { addRound } from '../api/session'

const props = defineProps(['session'])

const players = props.session.players

const dealer = ref(
 props.session.rounds?.length
  ? props.session.rounds[props.session.rounds.length-1].dealer
  : players[0]
)

const scores = ref({})

const totals = ref({})

const rounds = ref(props.session.rounds || [])

/* init totals */

players.forEach(p=>{
 totals.value[p] = props.session.totals?.[p] || 0
})

function changeScore(p,val){

 if(!scores.value[p]) scores.value[p]=0

 scores.value[p]+=val

}

async function saveRound(){

 const payload={
  session_id:props.session.id,
  dealer:dealer.value,
  scores:scores.value
 }

 const res=await addRound(payload)

 const dealerScore=res.data.dealer_score
 const roundNo=res.data.round_no

 const round={
  round:roundNo,
  dealer:dealer.value,
  scores:{...scores.value}
 }

 round.scores[dealer.value]=dealerScore

 rounds.value.push(round)

 Object.keys(round.scores).forEach(p=>{
  totals.value[p]+=round.scores[p]
 })

 scores.value={}

}
</script>

<template>

<div class="max-w-md mx-auto p-4 space-y-4">

<!-- HEADER -->

<div class="bg-white shadow rounded-xl p-3 flex justify-between">

<div>
<div class="text-xs text-gray-500">Dealer</div>
<select v-model="dealer" class="border rounded px-2 py-1">

<option v-for="p in session.players" :key="p">
{{p}}
</option>

</select>
</div>

<div>
<div class="text-xs text-gray-500">Step</div>
<div class="font-bold text-lg">{{session.step}}</div>
</div>

</div>


<!-- SCORE PAD -->

<div class="bg-white shadow rounded-xl">

<div
v-for="p in session.players"
:key="p"
class="flex items-center justify-between p-3 border-b"
>

<div class="font-medium w-20">
{{p}}
</div>

<div v-if="p!==dealer" class="flex items-center gap-3">

<button
class="bg-gray-200 rounded w-10 h-10 text-xl"
@click="changeScore(p,-session.step)"
>
-
</button>

<div class="w-12 text-center font-bold">
{{scores[p]||0}}
</div>

<button
class="bg-green-500 text-white rounded w-10 h-10 text-xl"
@click="changeScore(p,session.step)"
>
+
</button>

</div>

<div v-else class="text-sm text-gray-400">
Dealer
</div>

</div>

</div>


<!-- SAVE BUTTON -->

<button
class="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
@click="saveRound"
>
Save Round
</button>


<!-- TOTALS -->

<div class="bg-white shadow rounded-xl p-3">

<div class="font-bold mb-2">
Totals
</div>

<div
v-for="(v,k) in totals"
:key="k"
class="flex justify-between"
>

<div>{{k}}</div>

<div
:class="v>=0?'text-green-600 font-bold':'text-red-600 font-bold'"
>
{{v}}
</div>

</div>

</div>


<!-- ROUNDS -->

<div class="bg-white shadow rounded-xl p-3 overflow-x-auto">

<div class="font-bold mb-2">
Rounds
</div>

<table class="text-sm w-full">

<thead>

<tr class="border-b">
<th>#</th>
<th>Dealer</th>
<th v-for="p in session.players">{{p}}</th>
</tr>

</thead>

<tbody>

<tr
v-for="r in rounds"
:key="r.round"
class="border-b"
>

<td>{{r.round}}</td>
<td>{{r.dealer}}</td>

<td v-for="p in session.players">
{{r.scores[p]}}
</td>

</tr>

</tbody>

</table>

</div>

</div>

</template>