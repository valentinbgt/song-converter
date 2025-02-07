<template>
  <div>
    <h1>Paste your link</h1>
    <UInput v-model="link" @keyup.enter="convert" @paste="onPaste" />
    <p>
      <UToggle v-model="redirect" />
      <span>Auto redirect</span>
    </p>
    <p>
      <UToggle v-model="convertOnPaste" />
      <span>Convert on pasting</span>
    </p>
    <p>
      <UToggle v-model="newTab" />
      <span>Open in new tab</span>
    </p>
    <UButton :disabled="!isUrlValid(link)" :loading="loading" @click="convert"
      >Convert</UButton
    >
  </div>

  <div v-if="result.redirectUrl">
    <p>{{ result.redirectUrl }}</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";

const link = ref("");
const redirect = ref(true);
const convertOnPaste = ref(true);
const newTab = ref(false);
const loading = ref(false);

interface ConvertResult {
  redirectUrl?: string;
}

const result = ref<ConvertResult>({});

function isUrlValid(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function onPaste(event: Event) {
  if (convertOnPaste.value) {
    nextTick(() => {
      convert();
    });
  }
}

async function convert() {
  if (!isUrlValid(link.value)) return;

  loading.value = true;
  try {
    result.value = await $fetch<ConvertResult>("/api/convert", {
      method: "POST",
      body: {
        url: link.value,
      },
    });

    if (redirect.value && result.value.redirectUrl) {
      if (newTab.value) {
        window.open(result.value.redirectUrl, "_blank");
      } else {
        window.location.href = result.value.redirectUrl;
      }
    }
  } catch (error) {
    console.error("Error converting URL:", error);
  } finally {
    loading.value = false;
  }
}
</script>
