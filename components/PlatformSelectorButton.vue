<template>
  <UTooltip
    :text="disabled ? 'This platform is not available yet' : ''"
    :popper="{ placement: 'bottom' }"
  >
    <div
      class="p-2 rounded-md border border-gray-500"
      :class="{
        'border-primary': selected,
        'opacity-50': disabled,
        'cursor-pointer hover:border-white': !disabled,
        'cursor-not-allowed': disabled,
      }"
      @click="selectPlatform"
      :disabled="disabled"
    >
      <slot />
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
const props = defineProps<{
  selected: boolean;
  disabled: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

function selectPlatform() {
  if (props.disabled) return;
  emit("select");
}
</script>
