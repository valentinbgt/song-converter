<template>
  <div>
    <h1>Paste your link</h1>
    <UInput v-model="link" @keyup.enter="convert" @paste="onPaste" />
    <p>
      <UToggle v-model="redirect" />
      <span>Auto redirect</span>
      <UTooltip text="Automatically open the title on the target platform when match found." :popper="{ placement: 'right' }">
        <UKbd>?</UKbd>
      </UTooltip>

    </p>
    <p>
      <UToggle v-model="convertOnPaste" />
      <span>Convert on pasting</span>
      <UTooltip text="Convert the link when pasting detected." :popper="{ placement: 'right' }">
        <UKbd>?</UKbd>
      </UTooltip>
    </p>
    <p>
      <UToggle v-model="newTab" />
      <span>Open in new tab</span>
      <UTooltip text="Open the title in a new tab." :popper="{ placement: 'right' }">
        <UKbd>?</UKbd>
      </UTooltip>
    </p>
    <UButton :disabled="!isUrlValid(link)" :loading="loading" @click="convert"
      >Convert</UButton
    >
  </div>

  <div v-if="result.redirectUrl">
    <p>✅ - Match found</p>
    <p>{{ result.title }}</p>
    <p>{{ result.artist }}</p>
    <p>{{ result.album }}</p>
    <img :src="result.cover" />
    <UButton @click="openTitle">Open in Deezer</UButton>
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
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
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

function openTitle() {
  if (result.value.redirectUrl) {
    if (newTab.value) {
      window.open(result.value.redirectUrl, "_blank");
    } else {
      window.location.href = result.value.redirectUrl;
    }
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

    if (redirect.value) {
      openTitle();
    }
  } catch (error) {
    console.error("Error converting URL:", error);
  } finally {
    loading.value = false;
  }
}
</script>
