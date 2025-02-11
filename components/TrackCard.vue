<template>
  <div
    v-if="uniqueKey === target || target === 'all'"
    class="flex w-fit min-w-[500px] max-w-full border-2 border-white rounded-xl relative"
  >
    <div class="flex">
      <img :src="track.cover" class="rounded-lg w-64 h-64" />
      <div class="ml-4 mt-2">
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

console.log(props.uniqueKey, props.target);

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
