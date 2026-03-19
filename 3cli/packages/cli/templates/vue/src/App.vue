<template>
  <div class="app">
    <h1>{{ msg }}</h1>
    <button @click="count++">count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const msg = ref('Hello \{\{projectName\}\}!')
const count = ref(0)
</script>

<style scoped>
.app {
  text-align: center;
  margin-top: 60px;
}
</style>
