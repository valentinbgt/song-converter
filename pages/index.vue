<template>
  <div>
    <h1>Paste your link</h1>
    <UInput v-model="link" />
    <p>
      <UToggle v-model="redirect" />
      <span>Auto redirect <span class="text-xs italic">when pasting detected</span></span>
    </p>
    <p>
      <UToggle v-model="newTab" />
      <span>Open in new tab</span>
    </p>
    <UButton :disabled="!isUrlValid(link)">Convert</UButton>
  </div>
</template>

<script setup lang="ts">
const link = ref('')
const redirect = ref(true)
const newTab = ref(false)


function isUrlValid(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
</script>
