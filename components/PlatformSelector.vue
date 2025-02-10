<template>
  <p>Choose your favourite platform :</p>
  <div class="flex gap-4 p-2 flex-wrap w-full">
    <PlatformSelectorButton
      v-for="platform in platforms"
      :key="platform.value"
      :selected="selectedPlatform === platform.value"
      :disabled="platform.disabled"
      @select="selectPlatform(platform.value)"
      :label="platform.label"
      :icon="platform.icon"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  platforms: {
    value: string;
    label: string;
    disabled: boolean;
    icon: string;
  }[];
  selectedPlatform: string;
}>();

const emit = defineEmits<{
  select: [string];
}>();

const selectPlatform = (value: string) => {
  emit("select", value);
};
</script>
