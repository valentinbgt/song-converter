<template>
  <div class="flex items-center gap-2 m-2">
    <UToggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <span @click="toggle" class="cursor-pointer">{{ label }}</span>
    <UTooltip
      :text="description"
      :popper="{ placement: 'top' }"
      class="cursor-help"
    >
      <UKbd>?</UKbd>
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label: string;
  description: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};
</script>
