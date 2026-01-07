<!-- src/components/UnlikeIcon.vue -->
<template>
  <svg
    :width="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 心形 -->
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      :fill="unliked ? '#f56c6c' : 'none'"
      :stroke="unliked ? '#f56c6c' : '#999'"
      stroke-width="1.5"
    />
    <!-- 完全覆盖心形的斜线 -->
    <path
      d="M2 2l20 20"
      :stroke="unliked ? '#f56c6c' : '#999'"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  unliked?: boolean;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  unliked: false,
  size: 16,
});
</script>

<style scoped></style>
