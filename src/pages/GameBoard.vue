<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { addRound, deleteRound, updateRound, getSession } from '../api/session'

const props = defineProps(['session'])

const players = props.session.players

const dealer = ref(
  props.session.rounds?.length
    ? props.session.rounds[props.session.rounds.length - 1].dealer
    : players[0]
)

const scores = ref({})

const totals = ref({})

const rounds = ref(props.session.rounds || [])

const showEdit = ref(false)
const editData = ref(null)
const loading = ref(false)

const emit = defineEmits(['back'])

/* init totals */

players.forEach(p => {
  totals.value[p] = props.session.totals?.[p] || 0
})

function changeScore(p, val) {

  if (!scores.value[p]) scores.value[p] = 0

  scores.value[p] += val

}

function recalculateState() {

  /* reset totals */

  const newTotals = {}

  players.forEach(p => {
    newTotals[p] = 0
  })

  /* loop rounds */

  rounds.value.forEach(r => {

    Object.keys(r.scores).forEach(p => {

      if (!newTotals[p]) newTotals[p] = 0

      newTotals[p] += r.scores[p]

    })

  })

  totals.value = newTotals

}

function reindexRounds() {

  rounds.value = rounds.value.map((r, index) => ({
    ...r,
    round: index + 1
  }))

}

async function saveRound() {

  if (loading.value) return
  loading.value = true

  try {

    const payload = {
      session_id: props.session.id,
      dealer: dealer.value,
      scores: scores.value
    }

    const res = await addRound(payload)
    if (!res.success) alert(res.error)

    const dealerScore = res.data.dealer_score
    const roundNo = res.data.round_no

    const round = {
      round: roundNo,
      dealer: dealer.value,
      scores: { ...scores.value }
    }

    round.scores[dealer.value] = dealerScore

    rounds.value.push(round)


    reindexRounds()
    recalculateState()

    scores.value = {}

  } finally {

    loading.value = false

  }

}

const sortedTotals = computed(() => {

  return Object.entries(totals.value)
    .sort((a, b) => b[1] - a[1])

})


async function onDeleteRound(round) {

  if (!confirm("Delete this round?")) return
  if (loading.value) return

  loading.value = true

  try {

    const payload = {
      session_id: props.session.id,
      round_no: round.round
    }

    const res = await deleteRound(payload)
    if (!res.success) alert(res.error)

    rounds.value = rounds.value.filter(
      r => r.round !== round.round
    )

    reindexRounds()
    recalculateState()

  } finally {

    loading.value = false

  }

}

function onEditRound(round) {

  editData.value = JSON.parse(JSON.stringify(round))

  showEdit.value = true

}

async function saveEdit() {

  if (loading.value) return
  loading.value = true

  try {

    const payload = {
      session_id: props.session.id,
      round_no: editData.value.round,
      dealer: editData.value.dealer,
      scores: editData.value.scores
    }

    const res = await updateRound(payload)
    if (!res.success) alert(res.error)

    const index = rounds.value.findIndex(
      r => r.round === editData.value.round
    )

    rounds.value[index] = JSON.parse(
      JSON.stringify(editData.value)
    )

    recalculateState()

    showEdit.value = false

  } finally {

    loading.value = false

  }

}

</script>

<template>

  <div class="max-w-md mx-auto p-4 space-y-4">
    <div class="flex items-center justify-between mb-4">
      <button class="text-sm bg-gray-200 px-3 py-1 rounded-lg" @click="emit('back')">
        ← Back
      </button>
    </div>


    <span class="text-xl font-bold ">
      Session ID:
      <span class="text-red-600 "> {{ props.session.id }}</span>
    </span>


    <!-- HEADER -->

    <div class="bg-white shadow rounded-xl p-3 flex justify-between">

      <div>
        <div class="text-xs text-gray-500">Dealer</div>
        <select v-model="dealer" class="border rounded px-2 py-1">

          <option v-for="p in session.players" :key="p">
            {{ p }}
          </option>

        </select>
      </div>

      <div>
        <div class="text-xs text-gray-500">Step</div>
        <div class="font-bold text-lg">{{ session.step }}</div>
      </div>

    </div>


    <!-- SCORE PAD -->

    <div class="bg-white shadow rounded-xl">

      <div v-for="p in session.players" :key="p" class="flex items-center justify-between p-3 border-b">

        <div class="font-medium w-20">
          {{ p }}
        </div>

        <div v-if="p !== dealer" class="flex items-center gap-3">

          <button class="bg-gray-200 rounded w-10 h-10 text-xl" @click="changeScore(p, -session.step)">
            -
          </button>

          <div class="w-12 text-center font-bold">
            {{ scores[p] || 0 }}
          </div>

          <button class="bg-green-500 text-white rounded w-10 h-10 text-xl" @click="changeScore(p, session.step)">
            +
          </button>

        </div>

        <div v-else class="text-sm text-gray-400">
          Dealer
        </div>

      </div>

    </div>


    <!-- SAVE BUTTON -->

    <button :disabled="loading" class="w-full bg-green-600 text-white p-3 rounded-xl font-bold disabled:opacity-50"
      @click="saveRound">
      Save Round
    </button>


    <!-- TOTALS -->

    <div class="bg-white shadow rounded-xl p-3">

      <div class="font-bold mb-2">
        Totals
      </div>

      <div v-for="([k, v], i) in sortedTotals" :key="k" class="flex justify-between">

        <div>{{ k }}</div>

        <div :class="v >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
          {{ v }}
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
            <th v-for="p in session.players">{{ p }}</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          <tr v-for="r in rounds" :key="r.round" class="border-b">

            <td>{{ r.round }}</td>
            <td>{{ r.dealer }}</td>

            <td v-for="p in session.players">
              {{ r.scores?.[p] ?? 0 }}
            </td>
            <td class="flex gap-2">

              <button class="text-blue-600 text-sm" @click="onEditRound(r)">
                ✏
              </button>

              <button class="text-red-600 text-sm" @click="onDeleteRound(r)">
                🗑
              </button>

            </td>
          </tr>

        </tbody>

      </table>

    </div>

  </div>


  <div v-if="showEdit" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">

    <div class="bg-white p-4 rounded-xl w-80 space-y-3">

      <div class="font-bold text-lg">
        Edit Round {{ editData.round }}
      </div>

      <!-- dealer -->

      <div>

        <label class="text-sm">Dealer</label>

        <select v-model="editData.dealer" class="w-full border rounded p-2">

          <option v-for="p in session.players" :key="p">
            {{ p }}
          </option>

        </select>

      </div>

      <!-- scores -->

      <div v-for="p in session.players" :key="p">

        <div v-if="p !== editData.dealer" class="flex justify-between items-center">
          <div>{{ p }}</div>

          <input type="number" v-model.number="editData.scores[p]" class="border rounded p-1 w-20" />

        </div>

      </div>

      <!-- buttons -->

      <div class="flex gap-2 pt-2">

        <button class="flex-1 bg-gray-300 p-2 rounded" @click="showEdit = false">
          Cancel
        </button>

        <button class="flex-1 bg-green-600 text-white p-2 rounded" @click="saveEdit">
          Save
        </button>

      </div>

    </div>

  </div>

  <div v-if="loading" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

    <div class="bg-white px-6 py-4 rounded-xl shadow flex items-center gap-3">

      <div class="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>

      <div class="text-sm font-semibold">
        Processing...
      </div>

    </div>

  </div>

</template>