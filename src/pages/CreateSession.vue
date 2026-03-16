<script setup>
import { ref } from 'vue'
import { createSession,getSession } from '../api/session'

const emit = defineEmits(['created'])

const mode = ref('new') // new | resume

const sessionName = ref('')
const step = ref(5)
const players = ref(['',''])

const sessionId = ref('')

function addPlayer(){
 players.value.push('')
}

function removePlayer(i){
 players.value.splice(i,1)
}

async function start(){

 const payload = {
  players:players.value,
  step:step.value,
  session_name:sessionName.value
 }

 const res = await createSession(payload)

 emit('created',{
  id:res.data.session_id,
  players:players.value,
  step:step.value
 })
}

async function resume(){

 const res = await getSession(sessionId.value)

 const data = res.data

 emit('created',{
  id: data.session_id,
  players: data.players,
  step: data.step,
  totals: data.totals,
  rounds: data.rounds
 })

}
</script>

<template>

<div class="max-w-md mx-auto p-4 space-y-4">

<!-- title -->

<div class="text-center">

<h1 class="text-2xl font-bold">
Blackjack Score
</h1>

<p class="text-gray-500 text-sm">
Track your game easily
</p>

</div>

<!-- mode selector -->

<div class="flex bg-gray-200 rounded-xl p-1">

<button
class="flex-1 py-2 rounded-lg"
:class="mode==='new' ? 'bg-white shadow font-semibold':''"
@click="mode='new'"
>
New Session
</button>

<button
class="flex-1 py-2 rounded-lg"
:class="mode==='resume' ? 'bg-white shadow font-semibold':''"
@click="mode='resume'"
>
Resume Session
</button>

</div>

<!-- NEW SESSION -->

<div v-if="mode==='new'" class="bg-white shadow rounded-xl p-4 space-y-3">

<div>
<label class="text-sm text-gray-500">
Session Name
</label>

<input
v-model="sessionName"
placeholder="Tonight game"
class="w-full border rounded-lg p-2"
/>
</div>

<div>
<label class="text-sm text-gray-500">
Step (bet unit)
</label>

<input
v-model.number="step"
type="number"
class="w-full border rounded-lg p-2"
/>
</div>

<div>

<label class="text-sm text-gray-500">
Players
</label>

<div
v-for="(p,i) in players"
:key="i"
class="flex gap-2 mt-2"
>

<input
v-model="players[i]"
placeholder="Player name"
class="flex-1 border rounded-lg p-2"
/>

<button
class="bg-red-500 text-white px-3 rounded-lg"
@click="removePlayer(i)"
>
✕
</button>

</div>

<button
class="text-blue-600 text-sm mt-2"
@click="addPlayer"
>
+ Add Player
</button>

</div>

<button
class="w-full bg-green-600 text-white p-3 rounded-xl font-semibold"
@click="start"
>
Start Game
</button>

</div>

<!-- RESUME SESSION -->

<div v-if="mode==='resume'" class="bg-white shadow rounded-xl p-4 space-y-3">

<label class="text-sm text-gray-500">
Session ID
</label>

<input
v-model="sessionId"
placeholder="session_20260316_210500"
class="w-full border rounded-lg p-2"
/>

<button
class="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold"
@click="resume"
>
Load Session
</button>

</div>

</div>

</template>