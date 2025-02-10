<template>
  <UTooltip
    :text="disabled ? 'This platform is not available yet' : ''"
    :popper="{ placement: 'bottom' }"
  >
    <div
      class="py-3 px-4 rounded-md border border-gray-500 flex items-center gap-2"
      :class="{
        'border-primary': selected,
        'opacity-50': disabled,
        'cursor-pointer hover:border-white': !disabled,
        'cursor-not-allowed': disabled,
      }"
      @click="selectPlatform"
      :disabled="disabled"
    >
      <img :src="`/platforms-icons/${icon}`" class="w-6 h-6 object-contain" />
      <div class="text-nowrap text-base">
        {{ label }}
      </div>
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
  selected: boolean;
  disabled: boolean;
  icon: string;
  label: string;
}>();

const emit = defineEmits<{
  select: [];
}>();

function selectPlatform() {
  if (props.disabled) return;
  emit("select");
}
</script>
