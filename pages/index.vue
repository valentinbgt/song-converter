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
          :placeholder="inputPlaceholder"
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

    <UDivider class="my-4" size="sm">
      <span v-if="trackOfTheDay" class="flex items-center gap-1">
        Track of the day <UIcon name="bi:stars" />
      </span>
      <span v-else class="flex items-center gap-1">
        Search Result <UIcon name="flowbite:search-outline" />
      </span>
    </UDivider>
    <div
      v-if="result.redirectUrl"
      class="flex flex-wrap justify-center gap-4 mt-4 mb-8"
    >
      <TrackCard :track="result" :newTab="newTab" />
    </div>
    <div v-else class="flex justify-center">
      <p class="flex w-[500px] mt-4 mb-8 p-4 border-2 border-white rounded-xl">
        No content to display
      </p>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { _borderWidth } from "#tailwind-config/theme";
import { nextTick, ref, watch, onMounted } from "vue";

const link = ref("");

const redirect = ref(true);
const convertOnPaste = ref(true);
const newTab = ref(false);
const selectedPlatform = ref("deezer");
const inputPlaceholder = ref("Link of your track");
const trackOfTheDay = ref(true);

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
  {
    value: "all",
    label: "All Platforms",
    disabled: false,
    icon: "all.webp",
  },
];

interface DailyTrackResponse {
  redirectUrl: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
}

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

  $fetch<DailyTrackResponse>("/api/dailytrack").then((res) => {
    result.value = res;
    inputPlaceholder.value = res.url;
  });
});

const loading = ref(false);

interface ConvertResult {
  redirectUrl?: string;
  title?: string;
  artist?: string;
  album?: string;
  cover?: string;
  url?: string;
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

function checkClipboard(event: Event) {
  navigator.clipboard.readText().then((text) => {
    if (isUrlValid(text)) {
      link.value = text;
      onPaste(event);
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

    trackOfTheDay.value = false;

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
