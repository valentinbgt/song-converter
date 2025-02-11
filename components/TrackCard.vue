<template>
  <div
    class="flex w-fit min-w-[500px] max-w-full border-2 border-white rounded-xl relative"
  >
    <div class="flex">
      <img :src="track.cover" class="rounded-lg" />
      <div class="ml-4">
        <p class="text-2xl font-bold">{{ track.title }}</p>
        <p class="text-lg">{{ track.artist }}</p>
        <p class="text-sm text-gray-500">{{ track.album }}</p>
        <div class="absolute bottom-4 right-4">
          <UButton @click="openTitle" class="text-base">Open</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Track {
  redirectUrl: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
}
const props = defineProps<{
  track: {
    redirectUrl?: string;
    title?: string;
    artist?: string;
    album?: string;
    cover?: string;
    url?: string;
  };
  newTab: boolean;
}>();

function openTitle() {
  if (props.track.redirectUrl) {
    if (props.newTab) {
      window.open(props.track.redirectUrl, "_blank");
    } else {
      window.location.href = props.track.redirectUrl;
    }
  }
}
</script>
