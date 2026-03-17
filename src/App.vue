<script setup>
import { ref, onMounted } from 'vue'
import CreateSession from './pages/CreateSession.vue'
import GameBoard from './pages/GameBoard.vue'
import { getSession } from './api/session'

const session = ref(null)
const createKey = ref(0)
const loading = ref(false)

onMounted(async () => {

  const sessionId = localStorage.getItem("bj_session")

  if (!sessionId) return

  const resume = confirm("Resume last session?")

  if (!resume) {
    localStorage.removeItem("bj_session")
    return
  }

  loading.value = true

  try {

    const res = await getSession(sessionId)

    const data = res.data

    session.value = {
      id: data.session_id,
      players: data.players,
      step: data.step,
      totals: data.totals,
      rounds: data.rounds
    }

  } catch (err) {

    alert("Session not found")

    localStorage.removeItem("bj_session")

  } finally {

    loading.value = false

  }

})

function onSessionCreated(data) {

  session.value = data

  localStorage.setItem(
    "bj_session",
    data.id
  )

}

function goBack() {

  session.value = null

  createKey.value++

}
</script>

<template>

  <div style="max-width:500px;margin:auto;padding:20px;position:relative">

    <CreateSession v-if="!session" :key="createKey" @created="onSessionCreated" />

    <GameBoard v-else :session="session" @back="goBack" />

    <!-- LOADING -->

    <div v-if="loading" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div class="bg-white px-6 py-4 rounded-xl shadow flex items-center gap-3">

        <div class="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>

        <div class="text-sm font-semibold">
          Loading session...
        </div>

      </div>

    </div>

  </div>

</template>