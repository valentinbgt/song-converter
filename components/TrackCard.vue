<template>
  <div
    v-if="uniqueKey === target || target === 'all'"
    class="flex w-fit min-w-[500px] max-w-full border dark:border-gray-400 border-gray-600 rounded-xl relative overflow-hidden"
  >
    <div class="flex">
      <img
        :src="
          track.cover || 'https://cdn-images.dzcdn.net/images/cover/500x500.jpg'
        "
        class="w-64 h-64"
      />
      <div class="ml-4 mt-2 mr-4">
        <p class="text-2xl font-bold">
          {{ track.title || "No content to display" }}
        </p>
        <p class="text-lg">
          {{ track.artist || "The request failed" }}
        </p>
        <p class="text-sm text-gray-500">
          {{ track.album || "Try reloading the page" }}
        </p>
        <div class="absolute bottom-4 right-4">
          <UButton @click="openTitle" class="text-base">Open</UButton>
        </div>

        <div v-if="track.deezerId" class="absolute bottom-4 left-4">
          <UButton @click="lauchPreview" class="text-base rounded-full p-2">
            <UIcon
              v-if="!audioPlaying"
              name="material-symbols:play-arrow-rounded"
              class="w-8 h-8"
            />
            <UIcon
              v-else
              name="material-symbols:stop-rounded"
              class="w-8 h-8"
            />
          </UButton>
          <audio
            v-if="track.deezerId"
            :src="`/api/preview?id=${track.deezerId}`"
            :id="track.deezerId"
            @ended="audioPlaying = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* interface Track {
  redirectUrl: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
} */
const props = defineProps<{
  track: any;
  newTab: boolean;
  uniqueKey: string;
  target: string;
}>();

let audio = ref<HTMLAudioElement | null>(null);
let audioPlaying = ref(false);
function openTitle() {
  if (props.track.redirectUrl) {
    if (props.newTab) {
      window.open(props.track.redirectUrl, "_blank");
    } else {
      window.location.href = props.track.redirectUrl;
    }
  }
}

function lauchPreview() {
  if (props.track.deezerId) {
    audio.value = document.getElementById(
      props.track.deezerId
    ) as HTMLAudioElement;

    if (audio.value) {
      if (!audioPlaying.value) {
        audio.value.currentTime = 0;
        audio.value.play();
        audioPlaying.value = true;
      } else {
        audio.value.pause();
        audioPlaying.value = false;
      }
    }
  }
}
</script>
