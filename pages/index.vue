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
    <UButton :disabled="!isUrlValid(link)" :loading="loading" @click="convert">Convert</UButton>
  </div>

  <div v-if="result.redirectUrl">
    <p>{{ result.redirectUrl }}</p>
    </div>
</template>

<script setup lang="ts">
const link = ref('')
const redirect = ref(true)
const newTab = ref(false)
const loading = ref(false)

interface ConvertResult {
  redirectUrl?: string
}

const result = ref<ConvertResult>({})

function isUrlValid(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

async function convert() {
  if (!isUrlValid(link.value)) return

  loading.value = true
  try {
    result.value = await $fetch('/api/convert', {
      method: 'POST',
      body: {
        url: link.value
      }
    })
  } catch (error) {
    console.error('Error converting URL:', error)
  } finally {
    loading.value = false
  }
}
</script>
