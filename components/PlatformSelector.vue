<template>
  <p>Choose your favourite platform</p>
  <div class="flex gap-4 p-2">
    <PlatformSelectorButton
      v-for="platform in platforms"
      :key="platform.value"
      :selected="selectedPlatform === platform.value"
      :disabled="platform.disabled"
      @select="selectPlatform(platform.value)"
    >
      {{ platform.label }}
    </PlatformSelectorButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  platforms: {
    value: string;
    label: string;
    disabled: boolean;
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
