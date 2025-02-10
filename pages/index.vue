<template>
  <UContainer class="mt-8">
    <!--page title-->
    <div>
      <h1 class="text-3xl font-bold w-full text-center">
        Any music link to your favorite platform
      </h1>
    </div>

    <!--form-->
    <div class="mt-4">
      <div class="mt-4">
        <URadioGroup
          v-model="selectedPlatform"
          legend="Vers quelle plateforme veux-tu être redirigé ?"
          :options="platforms"
        />
      </div>
      <p>Paste your link</p>
      <p>
        <UToggle v-model="redirect" />
        <span>Auto redirect</span>
        <UTooltip
          text="Automatically open the title on the target platform when match found."
          :popper="{ placement: 'right' }"
        >
          <UKbd>?</UKbd>
        </UTooltip>
      </p>
      <p>
        <UToggle v-model="convertOnPaste" />
        <span>Convert on pasting</span>
        <UTooltip
          text="Convert the link when pasting detected."
          :popper="{ placement: 'right' }"
        >
          <UKbd>?</UKbd>
        </UTooltip>
      </p>
      <p>
        <UToggle v-model="newTab" />
        <span>Open in new tab</span>
        <UTooltip
          text="Open the title in a new tab."
          :popper="{ placement: 'right' }"
        >
          <UKbd>?</UKbd>
        </UTooltip>
      </p>
      <UContainer class="flex gap-2">
        <UButtonGroup size="md" orientation="horizontal">
          <UInput
            v-model="link"
            @keyup.enter="convert"
            @paste="onPaste"
            class="w-96"
            placeholder="https://open.spotify.com/intl-fr/track/6xjG4EZM1rTMFJeGRNE5hz?si=12627b1f009245c1"
          />
          <UButton
            @click="checkClipboard"
            icon="i-lucide:clipboard-paste"
            color="gray"
          />
          <UButton
            :disabled="!isUrlValid(link)"
            :loading="loading"
            @click="convert"
            >Convert</UButton
          >
        </UButtonGroup>
      </UContainer>
    </div>

    <div
      v-if="result.redirectUrl && !loading"
      class="flex mt-4 p-4 border-2 border-white rounded-xl"
    >
      <img :src="result.cover" class="rounded-lg" />
      <div class="ml-4">
        <p class="text-2xl font-bold">{{ result.title }}</p>
        <p class="text-lg">{{ result.artist }}</p>
        <p class="text-sm">{{ result.album }}</p>
        <UButton @click="openTitle">Open in {{ selectedPlatform }}</UButton>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { _borderWidth } from "#tailwind-config/theme";
import { nextTick, ref, watch, onMounted } from "vue";

const link = ref(
  "https://open.spotify.com/intl-fr/track/6xjG4EZM1rTMFJeGRNE5hz?si=12627b1f009245c1  "
);

const redirect = ref(true);
const convertOnPaste = ref(true);
const newTab = ref(false);
const selectedPlatform = ref("deezer");

const platforms = [
  {
    value: "spotify",
    label: "Spotify",
    disabled: false,
  },
  {
    value: "deezer",
    label: "Deezer",
    disabled: false,
  },
  {
    value: "applemusic",
    label: "Apple Music",
    disabled: true,
  },
  {
    value: "youtube",
    label: "YouTube",
    disabled: true,
  },
  {
    value: "youtubemusic",
    label: "YouTube Music",
    disabled: true,
  },
  {
    value: "soundcloud",
    label: "SoundCloud",
    disabled: true,
  },
  {
    value: "tidal",
    label: "Tidal",
    disabled: true,
  },
  {
    value: "amazonmusic",
    label: "Amazon Music",
    disabled: true,
  },
  {
    value: "napster",
    label: "Napster",
    disabled: true,
  },
];

onMounted(() => {
  redirect.value = localStorage.getItem("redirect") !== "false";
  convertOnPaste.value = localStorage.getItem("convertOnPaste") !== "false";
  newTab.value = localStorage.getItem("newTab") === "true";
  selectedPlatform.value = localStorage.getItem("selectedPlatform") || "deezer";

  watch(redirect, (newValue) => {
    localStorage.setItem("redirect", newValue.toString());
  });

  watch(convertOnPaste, (newValue) => {
    localStorage.setItem("convertOnPaste", newValue.toString());
  });

  watch(newTab, (newValue) => {
    localStorage.setItem("newTab", newValue.toString());
  });

  watch(selectedPlatform, (newValue) => {
    localStorage.setItem("selectedPlatform", newValue);
  });
});

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

function checkClipboard() {
  navigator.clipboard.readText().then((text) => {
    if (isUrlValid(text)) {
      link.value = text;
      convert();
    } else {
      console.log("Invalid URL");
    }
  });
}

async function convert() {
  if (!isUrlValid(link.value)) return;

  loading.value = true;
  try {
    console.log(selectedPlatform.value);
    result.value = await $fetch<ConvertResult>("/api/convert", {
      method: "POST",
      body: {
        url: link.value,
        targetPlatform: selectedPlatform.value,
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
