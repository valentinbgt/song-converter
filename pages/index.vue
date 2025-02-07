<template>
  <div>
    <h1>Paste your link</h1>
    <UInput v-model="value" />
  </div>
</template>

<script setup lang="ts">
const value = ref('')
</script>
