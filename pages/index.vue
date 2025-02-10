<template>
  <UContainer class="mt-8">
    <!--page title-->
    <div>
      <h1 class="text-3xl font-bold w-full text-center">
        Any music link to your favorite platform
      </h1>
    </div>

    <div class="mt-4">
      <PlatformSelector
        :platforms="platforms"
        :selectedPlatform="selectedPlatform"
        @select="selectPlatform"
      />
    </div>

    <div class="mt-4">
      <p>Paste your link :</p>

      <div class="flex gap-2 flex-wrap my-2">
        <Toggle
          v-model="redirect"
          label="Auto redirect"
          description="Automatically open the track when match found."
        />

        <Toggle
          v-model="convertOnPaste"
          label="Convert on pasting"
          description="Convert the link when pasting detected."
        />

        <Toggle
          v-model="newTab"
          label="Open in new tab"
          description="Open the track in a new tab."
        />
      </div>

      <UButtonGroup size="md" orientation="horizontal">
        <UInput
          v-model="link"
          @keyup.enter="convert"
          @paste="onPaste"
          class="w-[500px]"
          placeholder="https://open.spotify.com/intl-fr/track/6xjG4EZM1rTMFJeGRNE5hz"
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
    </div>

    <div
      v-if="result.redirectUrl && !loading"
      class="flex w-fit min-w-[600px] max-w-full mt-8 p-4 border-2 border-white rounded-xl relative mx-auto"
    >
      <img :src="result.cover" class="rounded-lg" />
      <div class="ml-4">
        <p class="text-2xl font-bold">{{ result.title }}</p>
        <p class="text-lg">{{ result.artist }}</p>
        <p class="text-sm text-gray-500">{{ result.album }}</p>
        <div class="absolute bottom-4 right-4">
          <UButton @click="openTitle" class="text-base"
            >Open in
            {{
              platforms.find((p) => p.value === selectedPlatform)?.label
            }}</UButton
          >
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { _borderWidth } from "#tailwind-config/theme";
import { nextTick, ref, watch, onMounted } from "vue";

const link = ref(
  "https://open.spotify.com/intl-fr/track/6xjG4EZM1rTMFJeGRNE5hz"
);

const redirect = ref(true);
const convertOnPaste = ref(true);
const newTab = ref(false);
const selectedPlatform = ref("deezer");

const platforms = [
  {
    value: "deezer",
    label: "Deezer",
    disabled: false,
    icon: "deezer.webp",
  },
  {
    value: "spotify",
    label: "Spotify",
    disabled: false,
    icon: "spotify.webp",
  },
  {
    value: "applemusic",
    label: "Apple Music",
    disabled: true,
    icon: "apple_music.webp",
  },
  {
    value: "youtube",
    label: "YouTube",
    disabled: true,
    icon: "youtube.webp",
  },
  {
    value: "youtubemusic",
    label: "YouTube Music",
    disabled: true,
    icon: "youtube_music.webp",
  },
  {
    value: "soundcloud",
    label: "SoundCloud",
    disabled: true,
    icon: "soundcloud.webp",
  },
  {
    value: "tidal",
    label: "Tidal",
    disabled: true,
    icon: "tidal.webp",
  },
  {
    value: "amazonmusic",
    label: "Amazon Music",
    disabled: true,
    icon: "amazon_music.webp",
  },
  {
    value: "napster",
    label: "Napster",
    disabled: true,
    icon: "napster.webp",
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

function selectPlatform(value: string) {
  selectedPlatform.value = value;
}

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
