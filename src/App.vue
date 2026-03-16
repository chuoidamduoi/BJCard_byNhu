<script setup>
import { ref } from 'vue'
import CreateSession from './pages/CreateSession.vue'
import GameBoard from './pages/GameBoard.vue'

const session = ref(null)

function onSessionCreated(data){
  session.value = data
}
</script>

<template>

<div style="max-width:500px;margin:auto;padding:20px">

  <CreateSession
    v-if="!session"
    @created="onSessionCreated"
  />

  <GameBoard
    v-else
    :session="session"
  />

</div>

</template>