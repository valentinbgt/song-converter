<template>
  <div
    class="flex w-fit min-w-[500px] max-w-full border-2 border-white rounded-xl relative"
  >
    <div class="flex">
      <USkeleton class="rounded-lg w-64 h-64" />
      <div class="ml-4 mt-2">
        <USkeleton class="w-28 h-7 my-2" />
        <USkeleton class="w-20 h-5 my-2" />
        <USkeleton class="w-16 h-4 my-2" />
        <div class="absolute bottom-4 right-4">
          <USkeleton class="w-16 h-10" />
        </div>
      </div>
    </div>
  </div>
</template>
