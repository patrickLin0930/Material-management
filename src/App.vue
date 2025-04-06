<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { initializeStyles } from 'src/db/init'

onMounted(() => {
  initializeStyles()
})
</script>
